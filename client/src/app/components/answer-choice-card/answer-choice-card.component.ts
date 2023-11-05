import { Component, Input, OnChanges } from '@angular/core';
import { intervalTime } from '@app/components/answer-choice-card/answer-choice-card.component.const';

@Component({
    selector: 'app-answer-choice-card',
    templateUrl: './answer-choice-card.component.html',
    styleUrls: ['./answer-choice-card.component.scss'],
})
export class AnswerChoiceCardComponent implements OnChanges {
    @Input() cardNumber: number;
    @Input() cardQuestion: string;
    @Input() selected: boolean;
    @Input() disabled: boolean;
    @Input() isCorrect: boolean | null | undefined;

    borderColor = 'black';
    borderWidth = '2px';
    borderReset = false;
    backgroundColor = 'white';
    ngOnChanges() {
        setInterval(() => {
            if (this.disabled) {
                this.borderColor = 'black';
                this.borderWidth = '2px';
                this.borderReset = true;
            }

            if (!this.disabled && this.borderReset) {
                this.selected = false;
                this.borderReset = false;
            }

            if (this.selected) {
                this.borderColor = 'blue';
                this.borderWidth = '4px';
            } else {
                this.borderColor = 'black';
                this.borderWidth = '2px';
            }

            if (this.isCorrect === true) {
                this.backgroundColor = 'green';
            }
        }, intervalTime);
    }

    selectedCard() {
        this.selected = !this.selected;
    }
}
