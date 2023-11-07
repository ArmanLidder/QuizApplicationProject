import { Component, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameService } from '@app/services/game.service/game.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    readonly title: string = 'OnlyQuiz';

    constructor(
        private socketClientService: SocketClientService,
        private gameService: GameService,
    ) {}

    ngOnInit() {
        if (this.socketClientService.isSocketAlive()) this.handleDisconnect();
    }
    private handleDisconnect() {
        const roomId = this.gameService.gameRealService.roomId;
        const isHost = this.gameService.gameRealService.username === 'Organisateur';
        const eventType = isHost ? socketEvent.hostLeft : socketEvent.playerLeft;
        this.socketClientService.send(eventType, roomId);
        this.gameService.destroy();
        this.socketClientService.disconnect();
    }
}
