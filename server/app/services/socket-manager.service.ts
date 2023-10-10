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

            // TODO create service to configure those event reception for organizer view
            socket.on('create Room', (quizID: string, callback) => {
                const roomCode = this.roomManager.addRoom(quizID);
                socket.join(String(roomCode))
                callback(roomCode);
            });

            socket.on('ban player', (data: { roomId: number; username: string }) => {
                const bannedID = this.roomManager.roomMap.get(data.roomId).players.get(data.username);
                this.roomManager.banUser(data.roomId, data.username);
                this.sio.to(String(data.roomId)).emit('banned player', data.username)
                this.sio.to(bannedID).emit('you have been banned');
            });

            socket.on('player join', (data: { roomId: number; username: string })=> {
                this.roomManager.addUser(data.roomId,data.username,socket.id);
                socket.join(String(data.roomId));
            });

            socket.on('toggle room lock', (roomId : number) => {
                this.roomManager.changeLockState(roomId);
            });
            // For above create service to configure those event reception for organizer view


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
