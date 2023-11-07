import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(private gameService: GameService) {}

    get isHost(): boolean {
        return this.gameService.username === 'Organisateur';
    }
}
