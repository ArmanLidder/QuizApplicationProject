import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-validation-quiz-error-feedback',
    templateUrl: './validation-quiz-error-feedback.component.html',
    styleUrls: ['./validation-quiz-error-feedback.component.scss'],
})
export class ValidationQuizErrorFeedbackComponent {
    @Input() errors: string | null;
    @Output() cancelOperation: EventEmitter<boolean> = new EventEmitter<boolean>();
    error: string = '';

    get errorsWithLineBreaks(): string {
        if (this.errors) {
            return this.errors.replace(/\n/g, '<br>');
        }
        return '';
    }

    returnToList() {
        this.cancelOperation.emit(true);
    }
}
