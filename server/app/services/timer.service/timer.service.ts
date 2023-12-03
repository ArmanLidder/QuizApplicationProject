import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as io from 'socket.io';
import { ONE_SECOND_DELAY } from '@common/constants/socket-manager.service.const';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { Service } from 'typedi';

type RoomData = { roomId: number; time: number };
@Service()
export class TimerService {
    constructor(
        private roomManager: RoomManagingService,
        private sio: io.Server,
    ) {}

    startTimer(roomData: RoomData, eventName?: string, delay = ONE_SECOND_DELAY) {
        const game = this.roomManager.getGameByRoomId(roomData.roomId);
        this.emitTime(this.sio, roomData, eventName);
        roomData.time--;
        this.roomManager.getRoomById(roomData.roomId).timer = setInterval(() => {
            if (game && game.paused) {
                return;
            } else if (roomData.time >= 0) {
                this.emitTime(this.sio, roomData, eventName);
                roomData.time--;
            } else {
                this.roomManager.clearRoomTimer(roomData.roomId);
            }
        }, delay);
    }

    private emitTime(sio: io.Server, roomData: RoomData, eventName?: string) {
        const event = eventName ?? socketEvent.TIME;
        sio.to(String(roomData.roomId)).emit(event, roomData.time);
    }
}
