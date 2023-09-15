import { Component } from '@angular/core';
import { QuizCreationService } from '@app/services/quiz-creation.service';

@Component({
    selector: 'app-quiz-creation-page',
    templateUrl: './quiz-creation-page.component.html',
    styleUrls: ['./quiz-creation-page.component.scss'],
})
export class QuizCreationPageComponent {
    title: string;
    duration: number;
    description: string;
    type: string;
    text: string;
    points: number;
    textchoix1: string;
    selectedChoice: string;

    constructor(public quizCreationService: QuizCreationService) {}

    onSubmit() {
        // Here you can send the data to your backend or perform any other necessary actions.
    }
}
