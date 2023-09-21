import { Injectable } from '@angular/core';
import { QuestionType } from '@app/interfaces/quiz.interface';

export interface FormChoice {
    text: string;
    isCorrect: boolean;
}

export interface FormQuestion {
    type: QuestionType;
    text: string;
    points: number;
    choices: FormChoice[];
    beingModified: boolean;
}

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
            type: QuestionType.QCM,
            text: '',
            points: 0,
            choices: [], // Add an empty choices array
            beingModified: false,
        };

        this.questions.push(newQuestion);
    }

    addChoice(question: FormQuestion) {
        if (question.choices.length < 4) {
            const newChoice = {
                text: '',
                isCorrect: false,
            };
            question.choices.push(newChoice);
        }
    }
}
