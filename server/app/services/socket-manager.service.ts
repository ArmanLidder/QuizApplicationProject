import * as io from 'socket.io';
import * as http from 'http';
import { RoomManagingService } from '@app/services/room-managing.service';
import { Message } from '@common/interfaces/message.interface';

const ONE_SECOND_DELAY = 1000;
export class SocketManager {
    private sio: io.Server;
    private roomManager: RoomManagingService;

    constructor(server: http.Server) {
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

            socket.on('player join', (data: { roomId: number; username: string }, callback) => {
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

            socket.on('ban player', (data: { roomId: number; username: string }) => {
                const bannedID = this.roomManager.getSocketIDByUsername(data.roomId, data.username);
                this.roomManager.banUser(data.roomId, data.username);
                this.sio.to(bannedID).emit('removed from game');
                this.sio.to(String(data.roomId)).emit('removed player', data.username);
            });

            socket.on('toggle room lock', (roomId: number) => {
                this.roomManager.changeLockState(roomId);
            });

            socket.on('validate username', (data: { roomId: number; username: string }, callback) => {
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
                this.sio.to(String(roomId)).emit('removed from game');
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

            socket.on('new message', (data: { roomId: number; message: Message }) => {
                this.roomManager.addMessage(data.roomId, data.message);
                this.sio.to(String(data.roomId)).emit('message received', data.message);
            });

            socket.on('start', (data: { roomId: number; time: number }) => {
                this.timerFunction(data.roomId, data.time);
            });

            socket.on('disconnect', (reason) => {
                // eslint-disable-next-line no-console
                console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
                // eslint-disable-next-line no-console
                console.log(`Raison de déconnexion : ${reason}`);
            });
        });
    }

    private timerFunction(roomId: number, timeValue: number) {
        this.emitTime(roomId, timeValue--);
        this.roomManager.getRoomById(roomId).timer = setInterval(() => {
            if (timeValue >= 0) {
                this.emitTime(roomId, timeValue);
                timeValue--;
            } else {
                this.roomManager.clearRoomTimer(roomId);
            }
        }, ONE_SECOND_DELAY);
    }

    private emitTime(roomId: number, time: number) {
        this.sio.to(String(roomId)).emit('time', time);
    }
}
