import { Component } from '@angular/core';
import { QuizCreationService } from '@app/services/quiz-creation.service';

@Component({
    selector: 'app-quiz-creation',
    templateUrl: './quiz-creation.component.html',
    styleUrls: ['./quiz-creation.component.scss'],
})
export class QuizCreationComponent {
    title: string;
    duration: number;
    description: string;

    constructor(public quizCreationService: QuizCreationService) {}

    onSubmit(form: unknown) {
        if (form.valid) {
            const now = new Date();
            const isoString = now.toString();
            const formattedString = isoString.replace(/\.(\d{3})Z$/, 'Z');
            console.log('Form submitted!', this.title, this.duration, this.description, this.quizCreationService.questions, formattedString);
        } else {
            console.log('Form is invalid!');
        }
    }
}
