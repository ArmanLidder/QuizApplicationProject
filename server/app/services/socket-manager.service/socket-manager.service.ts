import { Game } from '@app/classes/game/game';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as http from 'http';
import * as io from 'socket.io';
import {ONE_SECOND_DELAY,TRANSITION_QUESTIONS_DELAY} from '@app/services/socket-manager.service/socket-manager.service.const';
import {
    roomIdAndAnswers,
    roomIdAndMessage, roomIdAndSelection,
    roomIdAndTime,
    roomIdAndUsername,
} from '@common/interfaces/socket-manager.interface';

export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagingService;

    constructor(
        private quizService: QuizService,
        server: http.Server,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomManager = new RoomManagingService();
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            // eslint-disable-next-line no-console
            console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
            socket.emit('hello', 'Hello World!');
            socket.on('create Room', (quizID: string, callback) => {
                const roomCode = this.roomManager.addRoom(quizID);
                this.roomManager.addUser(roomCode, 'Organisateur', socket.id);
                socket.join(String(roomCode));
                callback(roomCode);
            });

            socket.on('player join', (data: roomIdAndUsername, callback) => {
                const isLocked = this.roomManager.isRoomLocked(data.roomId);
                if (!isLocked) {
                    this.roomManager.addUser(data.roomId, data.username, socket.id);
                    const players = this.roomManager.getUsernamesArray(data.roomId);
                    socket.join(String(data.roomId));
                    this.sio.to(String(data.roomId)).emit('new player', players);
                    callback(isLocked);
                } else {
                    callback(isLocked);
                }
            });

            socket.on('ban player', (data: roomIdAndUsername) => {
                const bannedID = this.roomManager.getSocketIDByUsername(data.roomId, data.username);
                this.roomManager.banUser(data.roomId, data.username);
                this.sio.to(bannedID).emit('removed from game');
                this.sio.to(String(data.roomId)).emit('removed player', data.username);
            });

            socket.on('toggle room lock', (roomId: number) => {
                this.roomManager.changeLockState(roomId);
            });

            socket.on('validate username', (data: roomIdAndUsername, callback) => {
                if (this.roomManager.isNameUsed(data.roomId, data.username)) {
                    callback({ isValid: false, error: 'Le nom choisi est déjà utiliser. Veuillez choisir un autre.' });
                } else if (this.roomManager.isNameBanned(data.roomId, data.username)) {
                    callback({ isValid: false, error: 'Vous avez été banni du lobby et vous ne pouvez plus rentrez.' });
                } else {
                    callback({ isValid: true, error: '' });
                }
            });

            socket.on('gather players username', (roomId: number, callback) => {
                const players = this.roomManager.getUsernamesArray(roomId);
                callback(players);
            });

            socket.on('validate roomID', (roomId: number, callback) => {
                let isLocked = false;
                const isRoom = this.roomManager.roomMap.has(roomId);
                if (isRoom) isLocked = this.roomManager.getRoomById(roomId).locked;
                callback({ isRoom, isLocked });
            });

            socket.on('player abandonment', (roomId: number) => {
                const userInfo = this.roomManager.removeUserBySocketID(socket.id);
                if (userInfo !== undefined) {
                    this.sio.to(String(roomId)).emit('removed player', userInfo.username);
                }
                socket.disconnect(true);
            });

            socket.on('host abandonment', (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                socket.to(String(roomId)).emit('removed from game');
                this.sio.in(String(roomId)).disconnectSockets(true);
                this.roomManager.deleteRoom(roomId);
            });

            socket.on('get messages', (data: number, callback) => {
                const messages = this.roomManager.getRoomById(data)?.messages;
                callback(messages);
            });

            socket.on('get username', (data: number, callback) => {
                const username = this.roomManager.getUsernameBySocketId(data, socket.id);
                callback(username);
            });

            socket.on('new message', (data: roomIdAndMessage) => {
                this.roomManager.addMessage(data.roomId, data.message);
                this.sio.to(String(data.roomId)).emit('message received', data.message);
            });

            socket.on('start', async (data: roomIdAndTime) => {
                const room = this.roomManager.getRoomById(data.roomId);
                const quizId = room.quizID;
                const usernames = this.roomManager.getUsernamesArray(data.roomId);
                this.roomManager.getRoomById(data.roomId).game = new Game(usernames, this.quizService);
                await this.roomManager.getRoomById(data.roomId).game.setup(quizId);
                this.timerFunction(data.roomId, data.time);
            });

            // Game socket
            socket.on('get question', (roomId: number) => {
                const game = this.roomManager.getGameByRoomId(roomId);
                const question = game.currentQuizQuestion;
                const index = game.currIndex + 1;
                const username = this.roomManager.getUsernameBySocketId(roomId, socket.id);
                socket.emit('get initial question', { question, username, index, numberOfQuestions: game.quiz.questions.length });
                const duration = this.roomManager.getGameByRoomId(roomId).duration;
                if (this.roomManager.getUsernameBySocketId(roomId, socket.id) === 'Organisateur') {
                    this.roomManager.clearRoomTimer(roomId);
                    this.timerFunction(roomId, duration);
                }
            });

            socket.on('submit answer', (data: roomIdAndAnswers) => {
                const game = this.roomManager.getGameByRoomId(data.roomId);
                this.roomManager.getGameByRoomId(data.roomId).storePlayerAnswer(data.username, data.timer, data.answers);
                if (game.playersAnswers.size === game.players.size) {
                    this.roomManager.getGameByRoomId(data.roomId).updateScores();
                    this.roomManager.clearRoomTimer(data.roomId);
                    this.sio.to(String(data.roomId)).emit('end question');
                }
            });

            socket.on('update selection', (data: roomIdAndSelection) => {
                const game = this.roomManager.getGameByRoomId(data.roomId);
                game.updateChoicesStats(data.isSelected, data.index);
                const hostSocketId = this.roomManager.getSocketIDByUsername(data.roomId, 'Organisateur');
                const choicesStatsValues = Array.from(game.choicesStats.values());
                this.sio.to(hostSocketId).emit('refresh choices stats', choicesStatsValues);
            });

            socket.on('start transition', (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                this.timerFunction(roomId, TRANSITION_QUESTIONS_DELAY, 'time transition');
            });

            socket.on('get score', (data: roomIdAndUsername, callback) => {
                const playerScore = this.roomManager.getGameByRoomId(data.roomId).players.get(data.username);
                callback(playerScore);
            });

            socket.on('next question', (roomId: number) => {
                let index = this.roomManager.getGameByRoomId(roomId).currIndex + 1;
                const quizSize = this.roomManager.getGameByRoomId(roomId).quiz.questions.length - 1;
                this.roomManager.clearRoomTimer(roomId);
                const isLast = index === quizSize;
                this.roomManager.getGameByRoomId(roomId).next();
                index++;
                const question = this.roomManager.getGameByRoomId(roomId).currentQuizQuestion;
                this.sio.to(String(roomId)).emit('get next question', { question, index, isLast });
                const duration = this.roomManager.getGameByRoomId(roomId).duration;
                this.timerFunction(roomId, duration);
            });

            socket.on('show result', (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                this.timerFunction(roomId, TRANSITION_QUESTIONS_DELAY, 'final time transition');
            });

            socket.on('disconnect', (reason) => {
                // eslint-disable-next-line no-console
                console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
                // eslint-disable-next-line no-console
                console.log(`Raison de déconnexion : ${reason}`);
            });
        });
    }

    private timerFunction(roomId: number, timeValue: number, eventName?: string) {
        this.emitTime(roomId, timeValue--, eventName);
        this.roomManager.getRoomById(roomId).timer = setInterval(() => {
            if (timeValue >= 0) {
                this.emitTime(roomId, timeValue, eventName);
                timeValue--;
            } else {
                this.roomManager.clearRoomTimer(roomId);
            }
        }, ONE_SECOND_DELAY);
    }

    private emitTime(roomId: number, time: number, eventName?: string) {
        const event = eventName ?? 'time';
        this.sio.to(String(roomId)).emit(event, time);
    }
}
