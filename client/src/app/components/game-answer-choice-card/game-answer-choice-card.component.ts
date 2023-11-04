import { Component, EventEmitter, Input, OnChanges, Output, HostListener } from '@angular/core';
import { QuizChoice } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service/game.service';

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

    handleHoverEffect() {
        return this.gameService.locked ? '' : 'active';
    }

    toggleSelect() {
        if (!this.gameService.locked && !this.gameService.isInputFocused) {
            this.isSelected = !this.isSelected;
            if (this.isSelected) this.showSelectionFeedback();
            else this.reset();
            this.selectEvent.emit(this.index - 1);
        }
    }

    private showResult() {
        if (this.choice.isCorrect) this.showGoodAnswerFeedBack();
        else this.showBadAnswerFeedBack();
    }

    private showSelectionFeedback() {
        this.feedbackDisplay = 'selected';
    }

    private reset() {
        this.feedbackDisplay = 'active';
    }

    private showGoodAnswerFeedBack() {
        this.feedbackDisplay = 'good-answer';
    }

    private showBadAnswerFeedBack() {
        this.feedbackDisplay = 'bad-answer';
    }
}
