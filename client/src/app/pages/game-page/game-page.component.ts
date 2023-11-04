import { Component, OnDestroy, ViewChild } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { HostInterfaceComponent } from '@app/components/host-interface/host-interface.component';
import { GameInterfaceComponent } from '@app/components/game-interface/game-interface.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    @ViewChild('app-game-interface') hostComponent: HostInterfaceComponent;
    @ViewChild('app-host-interface') playerComponent: GameInterfaceComponent;
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
            this.socketService.send(messageType, this.gameService.roomId);
            this.gameService.destroy();
        }
    }
}
