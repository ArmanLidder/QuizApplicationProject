import * as io from 'socket.io';
import * as http from 'http';
import { RoomManagingService } from '@app/services/room-managing.service';

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
            // message initial
            socket.emit('hello', 'Hello World!');

            // TODO create service to configure those event reception for organizer waiting view
            socket.on('create Room', (quizID: string, callback) => {
                const roomCode = this.roomManager.addRoom(quizID);
                socket.join(String(roomCode));
                callback(roomCode);
            });

            socket.on('ban player', (data: { roomId: number; username: string }) => {
                const bannedID = this.roomManager.getSocketIDByUsername(data.roomId, data.username);
                this.roomManager.banUser(data.roomId, data.username);
                this.sio.to(bannedID).emit('removed from game');
                this.sio.to(String(data.roomId)).emit('removed player', data.username);
            });

            // Todo verify if it works
            socket.on('toggle room lock', (roomId: number) => {
                this.roomManager.changeLockState(roomId);
            });
            // For above create service to configure those event reception for organizer view

            // TODO create service to configure those event reception for player joining view
            socket.on('player join', (data: { roomId: number; username: string }, callback) => {
                const isLocked = this.roomManager.getRoomByID(data.roomId).locked;
                if (!isLocked) {
                    this.roomManager.addUser(data.roomId, data.username, socket.id);
                    const room = this.roomManager.getRoomByID(data.roomId);
                    const players = Array.from(room.players.keys());
                    socket.join(String(data.roomId));
                    this.sio.to(String(data.roomId)).emit('new player', players);
                } else {
                    callback(isLocked);
                }
            });

            socket.on('validate username', (data: { roomId: number; username: string }, callback) => {
                if (this.roomManager.isNameUsed(data.roomId, data.username)) {
                    callback({ isValid: false, error: 'Le nom choisi est déjà utiliser. Veuillez choisir un autre.' });
                } else if (this.roomManager.isNameBanned(data.roomId, data.username)) {
                    callback({ isValid: false, error: 'Vous avez été banni du lobby et vous ne pouvez plus rentrez.' });
                } else {
                    callback({ isValid: true, error: '' });
                }
                // Todo complete by checking also in the banned list and upgrade (still case sensitive)
            });

            socket.on('validate roomID', (roomId: number, callback) => {
                let isLocked = false;
                const isRoom = this.roomManager.roomMap.has(roomId);
                if (isRoom) isLocked = this.roomManager.getRoomByID(roomId).locked;
                callback(isRoom && !isLocked);
            });

            // For above create service to configure those event reception for organizer view
            socket.on('player abandonment', (roomId: number) => {
                const socketData = this.roomManager.removeUserBySocketID(socket.id);
                if (socketData !== undefined) {
                    this.sio.to(String(roomId)).emit('removed player', socketData.username);
                }
                socket.disconnect(true);
            });

            socket.on('host abandonment', (roomId: number) => {
                this.sio.to(String(roomId)).emit('removed from game');
                this.sio.in(String(roomId)).disconnectSockets(true);
                this.roomManager.deleteRoom(roomId);
            });

            socket.on('disconnect', (reason) => {
                // eslint-disable-next-line no-console
                console.log(`Deconnexion par l'utilisateur avec id : ${socket.id}`);
                // eslint-disable-next-line no-console
                console.log(`Raison de deconnexion : ${reason}`);
            });
        });

        setInterval(() => {
            this.emitTime();
        }, ONE_SECOND_DELAY);
    }

    emitTime() {
        this.sio.sockets.emit('clock', new Date().toLocaleTimeString());
    }
}
