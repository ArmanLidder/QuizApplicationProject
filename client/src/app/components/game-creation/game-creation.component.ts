import { Component } from '@angular/core';
import { QuizCreationService } from '@app/services/quiz-creation.service';

@Component({
    selector: 'app-game-creation',
    templateUrl: './game-creation.component.html',
    styleUrls: ['./game-creation.component.scss'],
})
export class GameCreation {
    title: string;
    duration: number;
    description: string;
    questions: any[] = [];

    constructor(public quizCreationService: QuizCreationService) {};


    onSubmit(form: any) {
        if (form.valid) {
            const now = new Date();
            const isoString = now.toString();
            const formattedString = isoString.replace(/\.(\d{3})Z$/, 'Z');
            console.log('Form submitted!', formattedString);
        } else {
            console.log('Form is invalid!');
        }
    }
}
