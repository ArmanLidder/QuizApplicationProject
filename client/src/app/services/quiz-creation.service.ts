import { Injectable } from '@angular/core';
import { FormQuestion } from '@app/interfaces/form';

const MAX_CHOICES_NUMBER = 4;

@Injectable({
    providedIn: 'root',
})
export class QuizCreationService {
    gameTitle: string;
    gameDuration: number;
    gameDescription: string;
    questions: FormQuestion[] = [];

    addQuestion() {
        const newQuestion: FormQuestion = {
            type: 'qcm',
            text: '',
            points: 0,
            textchoix: '',
            selectedChoice: '',
            choices: [], // Add an empty choices array
        };

        this.questions.push(newQuestion);
    }

    addChoice(question: FormQuestion) {
        if (question.choices.length < MAX_CHOICES_NUMBER) {
            const newChoice = {
                text: '',
                selectedChoice: '',
            };
            question.choices.push(newChoice);
        }
    }
}
