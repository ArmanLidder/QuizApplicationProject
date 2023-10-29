import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-answers-list',
    templateUrl: './game-answers-list.component.html',
    styleUrls: ['./game-answers-list.component.scss'],
})
export class GameAnswersListComponent {
    // @Input() duration: number;
    // @Input() question: QuizQuestion;
    // validated: boolean = false;
    // timer: number = 25;
    // answers: Map<number, string | null> = new Map<number, string | null>();
    private receptionDebounce: number = 0;

    constructor(
        public gameService: GameService,
        private socketClientService: SocketClientService,
    ) {}

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
            this.socketClientService.send('player answer', {
                roomId: this.gameService.roomId,
                answers: this.gameService.answers,
                time: this.gameService.timer,
            });
        }
    }
}
