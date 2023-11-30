import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { HOST_USERNAME } from '@common/names/host-username';


@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy, OnInit {
    constructor(
        private gameService: GameService,
        private readonly socketService: SocketClientService,
        public route: Router,
    ) {}

    get isHost(): boolean {
        return this.gameService.username === HOST_USERNAME;
    }

    ngOnInit() {
        window.onbeforeunload = () => this.ngOnDestroy();
        window.onload = async () => this.route.navigate(['/']);
    }

    ngOnDestroy() {
        const messageType = this.isHost ? socketEvent.HOST_LEFT : socketEvent.PLAYER_LEFT;
        if (this.socketService.isSocketAlive()) {
            this.socketService.send(messageType, this.gameService.gameRealService.roomId);
        }
        this.gameService.destroy();
        this.gameService.audio.pause();
    }
}
