import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service';


@Component({
  selector: 'app-game-answers-list',
  templateUrl: './game-answers-list.component.html',
  styleUrls: ['./game-answers-list.component.scss']
})

export class GameAnswersListComponent {
    @Input() duration: number;
    @Input() question: QuizQuestion;
    @Output() sendSelectedChoices: EventEmitter<Map<number, string | null>>;
    validated: boolean = false;
    timer: number = 25;
    answers: Map<number, string | null> = new Map<number, string | null>;
    private receptionDebounce: number = 0;

    constructor(private socketClientService: SocketClientService) {}


    selectChoice(index: number) {
        if (!this.validated) {
            if (this.answers.has(index)) {
                this.answers.delete(index);
            } else {
                const textChoice = this.question.choices ? this.question.choices[index].text : null;
                this.answers.set(index, textChoice);
            }
            this.sendSelectedChoices.emit(this.answers)
        }
    }


    handleMultipleEmission() {
        this.receptionDebounce += 1;
        if (this.receptionDebounce === this.question.choices?.length) this.validate();
    }

    validate() {
        if (!this.validated) {
            this.validated = true;
            this.socketClientService.send('player answer',
                { roomId: 1, answers: this.answers, time: this.duration - this.timer });
        }
    }
}
