import { Component, EventEmitter, Input, OnChanges, Output, HostListener } from '@angular/core';
import { QuizChoice } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-answer-choice-card',
    templateUrl: './game-answer-choice-card.component.html',
    styleUrls: ['./game-answer-choice-card.component.scss'],
})
export class GameAnswerChoiceCardComponent implements OnChanges {
    @Input() choice: QuizChoice;
    @Input() index: number;
    @Output() selectEvent = new EventEmitter<number>();
    @Output() enterPressed = new EventEmitter<void>();

    isSelected: boolean = false;
    isCorrect: boolean;
    feedbackDisplay: string = 'normal';

    constructor(public gameService: GameService) {}

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === String(this.index)) this.toggleSelect();
        else if (event.key === 'Enter') this.enterPressed.emit();
    }

    ngOnChanges() {
        if (this.gameService.validated) this.showResult();
    }

    toggleSelect() {
        if (!this.gameService.validated) {
            this.isSelected = !this.isSelected;
            this.isSelected ? this.showSelectionFeedback() : this.reset();
            this.selectEvent.emit(this.index - 1);
        }
    }

    private showResult() {
        this.choice.isCorrect ? this.showGoodAnswerFeedBack() : this.showBadAnswerFeedBack();
    }

    private showSelectionFeedback() {
        this.feedbackDisplay = 'selected';
    }

    private reset() {
        this.feedbackDisplay = 'normal';
    }

    private showGoodAnswerFeedBack() {
        this.feedbackDisplay = 'good-answer';
    }

    private showBadAnswerFeedBack() {
        this.feedbackDisplay = 'bad-answer';
    }
}
