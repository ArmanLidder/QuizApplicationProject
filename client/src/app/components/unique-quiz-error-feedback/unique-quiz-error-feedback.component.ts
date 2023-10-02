import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-unique-quiz-error-feedback',
    templateUrl: './unique-quiz-error-feedback.component.html',
    styleUrls: ['./unique-quiz-error-feedback.component.scss'],
})
export class UniqueQuizErrorFeedbackComponent {
    @Input() quizName: string;
    @Output() sendNewQuizName: EventEmitter<string> = new EventEmitter<string>();
    @Output() cancelOperation: EventEmitter<boolean> = new EventEmitter<boolean>();

    newQuizName: string | undefined;
    inputBorderColor: string;
    textColor: string;
    error: string;

    emitQuizName() {
        if (this.newQuizName === undefined) {
            this.error = 'Le nom ne doit pas être vide!';
            this.showErrorFeedback();
        } else {
            this.sendNewQuizName.emit(this.newQuizName);
            this.reset();
        }
    }

    returnToList() {
        this.cancelOperation.emit(true);
    }

    private reset() {
        this.textColor = '';
        this.inputBorderColor = '';
        this.newQuizName = '';
    }

    private showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
