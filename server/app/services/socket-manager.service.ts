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

            socket.on('create Room', (callback) => {
                const roomCode = this.roomManager.addRoom();
                console.log(`Room code created for: ${socket.id}`);
                callback(roomCode);
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
