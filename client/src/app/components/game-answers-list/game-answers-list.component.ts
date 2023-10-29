import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-answers-list',
    templateUrl: './game-answers-list.component.html',
    styleUrls: ['./game-answers-list.component.scss'],
})
export class GameAnswersListComponent {
    private receptionDebounce: number = 0;

    constructor(public gameService: GameService) {}

    selectChoice(index: number) {
        this.gameService.selectChoice(index);
    }

    handleMultipleEmission() {
        this.receptionDebounce += 1;
        if (this.receptionDebounce === this.gameService.question.choices?.length) this.validate();
    }

    validate() {
        if (!this.gameService.validated) {
            this.gameService.validated = true;
            this.gameService.sendAnswer();
        }
    }
}
