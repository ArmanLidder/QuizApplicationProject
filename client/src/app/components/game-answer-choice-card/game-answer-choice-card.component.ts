import { Component, EventEmitter, Input, OnChanges, Output, HostListener } from '@angular/core';
import { QuizChoice } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service/game.service';

export const DEBOUNCE_TIMER = 10;

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
        if (this.gameService.validatedStatus) this.showResult();
    }

    handleHoverEffect() {
        return this.gameService.lockedStatus ? '' : 'active';
    }

    toggleSelect() {
        if (!this.gameService.lockedStatus && !this.gameService.isInputFocused) {
            this.isSelected = !this.isSelected;
            const isSelected = this.isSelected;
            if (this.isSelected) this.showSelectionFeedback();
            else this.reset();
            setTimeout(() => {
                if (isSelected === this.isSelected) {
                    this.selectEvent.emit(this.index - 1);
                }
            }, DEBOUNCE_TIMER);
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
