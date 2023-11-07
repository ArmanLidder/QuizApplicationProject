import { Component, OnDestroy } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    constructor(
        private gameService: GameService,
        private readonly socketService: SocketClientService,
    ) {}

    get isHost(): boolean {
        return this.gameService.username === 'Organisateur';
    }

    ngOnDestroy() {
        console.log('ngOnDestroy called on GamePage');
        const messageType = this.isHost ? socketEvent.hostLeft : socketEvent.playerLeft;
        if (this.socketService.isSocketAlive()) {
            console.log(`socket ${this.socketService.socket.id} sending event: ${messageType}`);
            this.socketService.send(messageType, this.gameService.gameRealService.roomId);
        }
        this.gameService.destroy();
    }
}
