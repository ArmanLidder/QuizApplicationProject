import { Component, OnDestroy } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';

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
        const messageType = this.isHost ? 'host abandonment' : 'player abandonment';
        if (this.socketService.isSocketAlive()) {
            this.socketService.send(messageType, this.gameService.gameRealService.roomId);
        }
        this.gameService.destroy();
    }
}
