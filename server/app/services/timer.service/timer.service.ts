import { RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import * as io from 'socket.io';
import { ONE_SECOND_DELAY } from '@app/services/socket-manager.service/socket-manager.service.const';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { Service } from 'typedi';

@Service()
export class TimerService {
    constructor(
        private roomManager: RoomManagingService,
        private sio: io.Server,
    ) {}

    // Comme le startTimer possède 2 paramètres optionnels pour des évènements de temps
    // particuliers et que la majorité du temps, la méthode sera implémentée avec 2 paramètres.
    // on préfère conserver une méthode adaptable à plusieurs situations. D'où la désactivation
    // du max-param pour les deux méthodes comme les paramètres se propagent dans la méthode
    // emitTime.
    // eslint-disable-next-line max-params
    startTimer(roomId: number, timeValue: number, eventName?: string, delay = ONE_SECOND_DELAY) {
        const game = this.roomManager.getGameByRoomId(roomId);
        this.emitTime(this.sio, roomId, timeValue, eventName);
        timeValue--;
        this.roomManager.getRoomById(roomId).timer = setInterval(() => {
            if (game && game.paused) {
                return;
            } else if (timeValue >= 0) {
                this.emitTime(this.sio, roomId, timeValue, eventName);
                timeValue--;
            } else {
                this.roomManager.clearRoomTimer(roomId);
            }
        }, delay);
    }

    // eslint-disable-next-line max-params
    private emitTime(sio: io.Server, roomId: number, time: number, eventName?: string) {
        const event = eventName ?? socketEvent.TIME;
        sio.to(String(roomId)).emit(event, time);
    }
}
