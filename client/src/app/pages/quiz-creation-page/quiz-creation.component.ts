import { Component } from '@angular/core';

@Component({
    selector: 'app-quiz-creation-page',
    templateUrl: './quiz-creation.component.html',
    styleUrls: ['./quiz-creation.component.scss'],
})
export class QuizCreationComponent {
    title: string;
    duration: number;
    description: string;
    type: string;
    text: string;
    points: number;
    textchoix1: string;
    selectedChoice: string;

    onSubmit() {
        console.log('Form submitted!');
        console.log('Title:', this.title);
        console.log('Duration:', this.duration);
        console.log('Description:', this.description);
        console.log('Type:', this.type);
        console.log('Text:', this.text);
        console.log('Points:', this.points);
        console.log('Text Choix 1:', this.textchoix1);
        console.log('Selected Choice:', this.selectedChoice);

        // Here you can send the data to your backend or perform any other necessary actions.
    }
}
