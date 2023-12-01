import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { PlayerMessage, PlayerUsername } from '@common/interfaces/socket-manager.interface';
import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as io from 'socket.io';

export class ChatService {
    configureChatSockets(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        this.handleGetMessage(roomManager, socket);
        this.handleNewMessage(roomManager, socket, sio);
        this.handleToggleChatPermission(roomManager, socket, sio);
        this.handleGetUsername(roomManager, socket);
    }
    private handleGetMessage(roomManager: RoomManagingService, socket: io.Socket) {
        socket.on(socketEvent.GET_MESSAGES, (data: number, callback) => {
            const messages = roomManager.getRoomById(data)?.messages;
            callback(messages);
        });
    }

    private handleNewMessage(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(socketEvent.NEW_MESSAGE, (data: PlayerMessage) => {
            roomManager.addMessage(data.roomId, data.message);
            sio.to(String(data.roomId)).emit(socketEvent.RECEIVED_MESSAGE, data.message);
        });
    }

    private handleToggleChatPermission(roomManager: RoomManagingService, socket: io.Socket, sio: io.Server) {
        socket.on(socketEvent.TOGGLE_CHAT_PERMISSION, (data: PlayerUsername) => {
            const playerSocket = roomManager.getSocketIdByUsername(data.roomId, data.username);
            sio.to(playerSocket).emit(socketEvent.TOGGLE_CHAT_PERMISSION);
        });
    }

    private handleGetUsername(roomManager: RoomManagingService, socket: io.Socket){
        socket.on(socketEvent.GET_USERNAME, (data: number, callback) => {
            const username = roomManager.getUsernameBySocketId(data, socket.id);
            callback(username);
        });
    }
}
