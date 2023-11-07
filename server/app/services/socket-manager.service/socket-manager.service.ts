import { Game } from '@app/classes/game/game';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as http from 'http';
import * as io from 'socket.io';
import { ONE_SECOND_DELAY, TRANSITION_QUESTIONS_DELAY } from '@app/services/socket-manager.service/socket-manager.service.const';
import { PlayerAnswerData, PlayerMessage, PlayerSelection, RemainingTime, PlayerUsername } from '@common/interfaces/socket-manager.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { errorDictionary } from '@common/browser-message/error-message/error-message';

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
        this.sio.on(socketEvent.connection, (socket) => {
            // eslint-disable-next-line no-console
            socket.on(socketEvent.createRoom, (quizID: string, callback) => {
                const roomCode = this.roomManager.addRoom(quizID);
                this.roomManager.addUser(roomCode, 'Organisateur', socket.id);
                socket.join(String(roomCode));
                callback(roomCode);
            });

            socket.on(socketEvent.joinGame, (data: PlayerUsername, callback) => {
                const isLocked = this.roomManager.isRoomLocked(data.roomId);
                if (!isLocked) {
                    this.roomManager.addUser(data.roomId, data.username, socket.id);
                    const players = this.roomManager.getUsernamesArray(data.roomId);
                    socket.join(String(data.roomId));
                    this.sio.to(String(data.roomId)).emit(socketEvent.newPlayer, players);
                }
                callback(isLocked);
            });

            socket.on(socketEvent.banPlayer, (data: PlayerUsername) => {
                const bannedID = this.roomManager.getSocketIDByUsername(data.roomId, data.username);
                this.roomManager.banUser(data.roomId, data.username);
                this.sio.to(bannedID).emit(socketEvent.removedFromGame);
                this.sio.to(String(data.roomId)).emit(socketEvent.removedPlayer, data.username);
            });

            socket.on(socketEvent.toggleRoomLock, (roomId: number) => {
                this.roomManager.changeLockState(roomId);
            });

            socket.on(socketEvent.validateUsername, (data: PlayerUsername, callback) => {
                let error = '';
                if (this.roomManager.isNameUsed(data.roomId, data.username)) error = errorDictionary.nameAlreadyUsed;
                else if (this.roomManager.isNameBanned(data.roomId, data.username)) error = errorDictionary.banMessage;
                callback({ isValid: error.length === 0, error });
            });

            socket.on(socketEvent.gatherPlayersUsername, (roomId: number, callback) => {
                const players = this.roomManager.getUsernamesArray(roomId);
                callback(players);
            });

            socket.on(socketEvent.validateRoomId, (roomId: number, callback) => {
                let isLocked = false;
                const isRoom = this.roomManager.roomMap.has(roomId);
                if (isRoom) isLocked = this.roomManager.getRoomById(roomId).locked;
                callback({ isRoom, isLocked });
            });

            socket.on(socketEvent.playerLeft, (roomId: number) => {
                const userInfo = this.roomManager.removeUserBySocketID(socket.id);
                if (userInfo) {
                    const game = this.roomManager.getGameByRoomId(roomId);
                    if (game) {
                        game.removePlayer(userInfo.username);
                        if (game.players.size === 0) {
                            this.roomManager.clearRoomTimer(roomId);
                            this.startTimer(roomId, TRANSITION_QUESTIONS_DELAY, socketEvent.finalTimeTransition);
                        } else if (game.playersAnswers.size === game.players.size) {
                            this.roomManager.getGameByRoomId(roomId).updateScores();
                            this.roomManager.clearRoomTimer(roomId);
                            this.roomManager.getRoomById(roomId).players.forEach((socketId, username) => {
                                if (username !== 'Organisateur') this.sio.to(socketId).emit(socketEvent.endQuestion);
                            });
                            this.sio.to(String(roomId)).emit(socketEvent.endQuestionAfterRemoval);
                        }
                    }
                    this.sio.to(String(roomId)).emit(socketEvent.removedPlayer, userInfo.username);
                }
                socket.disconnect(true);
            });

            socket.on(socketEvent.hostLeft, (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                socket.to(String(roomId)).emit(socketEvent.removedFromGame);
                this.roomManager.deleteRoom(roomId);
            });

            socket.on(socketEvent.getMessages, (data: number, callback) => {
                const messages = this.roomManager.getRoomById(data)?.messages;
                callback(messages);
            });

            socket.on(socketEvent.getUsername, (data: number, callback) => {
                const username = this.roomManager.getUsernameBySocketId(data, socket.id);
                callback(username);
            });

            socket.on(socketEvent.newMessage, (data: PlayerMessage) => {
                this.roomManager.addMessage(data.roomId, data.message);
                this.sio.to(String(data.roomId)).emit(socketEvent.receivedMessage, data.message);
            });

            socket.on(socketEvent.start, async (data: RemainingTime) => {
                const room = this.roomManager.getRoomById(data.roomId);
                const quizId = room.quizID;
                const usernames = this.roomManager.getUsernamesArray(data.roomId);
                room.game = new Game(usernames, this.quizService);
                await room.game.setup(quizId);
                this.startTimer(data.roomId, data.time);
            });

            socket.on(socketEvent.getQuestion, (roomId: number) => {
                const game = this.roomManager.getGameByRoomId(roomId);
                const question = game.currentQuizQuestion;
                const index = game.currIndex + 1;
                const username = this.roomManager.getUsernameBySocketId(roomId, socket.id);
                socket.emit(socketEvent.getInitialQuestion, { question, username, index, numberOfQuestions: game.quiz.questions.length });
                const duration = this.roomManager.getGameByRoomId(roomId).duration;
                if (this.roomManager.getUsernameBySocketId(roomId, socket.id) === 'Organisateur') {
                    this.roomManager.clearRoomTimer(roomId);
                    this.startTimer(roomId, duration);
                }
            });

            socket.on(socketEvent.submitAnswer, (data: PlayerAnswerData) => {
                const game = this.roomManager.getGameByRoomId(data.roomId);
                this.roomManager.getGameByRoomId(data.roomId).storePlayerAnswer(data.username, data.timer, data.answers);
                if (game.playersAnswers.size === game.players.size) {
                    this.roomManager.getGameByRoomId(data.roomId).updateScores();
                    this.roomManager.clearRoomTimer(data.roomId);
                    this.sio.to(String(data.roomId)).emit(socketEvent.endQuestion);
                }
            });

            socket.on(socketEvent.updateSelection, (data: PlayerSelection) => {
                const game = this.roomManager.getGameByRoomId(data.roomId);
                game.updateChoicesStats(data.isSelected, data.index);
                const hostSocketId = this.roomManager.getSocketIDByUsername(data.roomId, 'Organisateur');
                const choicesStatsValues = Array.from(game.choicesStats.values());
                this.sio.to(hostSocketId).emit(socketEvent.refreshChoicesStats, choicesStatsValues);
            });

            socket.on(socketEvent.startTransition, (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                this.startTimer(roomId, TRANSITION_QUESTIONS_DELAY, socketEvent.timeTransition);
            });

            socket.on(socketEvent.getScore, (data: PlayerUsername, callback) => {
                const playerScore = this.roomManager.getGameByRoomId(data.roomId).players.get(data.username);
                callback(playerScore);
            });

            socket.on(socketEvent.nextQuestion, (roomId: number) => {
                const game = this.roomManager.getGameByRoomId(roomId);
                this.roomManager.clearRoomTimer(roomId);
                const lastIndex = game.quiz.questions.length - 1;
                game.next();
                let index = game.currIndex;
                const isLast = index === lastIndex;
                const nextQuestionNumber = ++index;
                const nextQuestion = game.currentQuizQuestion;
                this.sio.to(String(roomId)).emit(socketEvent.getNextQuestion, { question: nextQuestion, index: nextQuestionNumber, isLast });
                this.startTimer(roomId, game.duration);
            });

            socket.on(socketEvent.showResult, (roomId: number) => {
                this.roomManager.clearRoomTimer(roomId);
                this.startTimer(roomId, TRANSITION_QUESTIONS_DELAY, socketEvent.finalTimeTransition);
            });

            socket.on(socketEvent.disconnect, (reason) => {
                // eslint-disable-next-line no-console
                console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
                // eslint-disable-next-line no-console
                console.log(`Raison de déconnexion : ${reason}`);
            });
        });
    }

    private startTimer(roomId: number, timeValue: number, eventName?: string) {
        this.emitTime(roomId, timeValue, eventName);
        timeValue--;
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
        const event = eventName ?? socketEvent.time;
        this.sio.to(String(roomId)).emit(event, time);
    }
}
