import { Injectable } from '@angular/core';

interface FormChoice {
    text: string;
    isRight: boolean;
    isValid: boolean;
}

interface FormQuestion {
    gameType: string; // maybe not for sprint 1 because we only do QCM questions
    text: string;
    points: number;
    choices: FormChoice[];
    selectedChoices: number[];
    isValid: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class QuizCreationService {
    gameTitle: string;
    gameDuration: number;
    gameDescription: string;
    questions: unknown[] = [];

    addQuestion() {
        const newQuestion = {
            type: 'qcm',
            text: '',
            points: null,
            textchoix: '',
            selectedChoice: '',
            choices: [], // Add an empty choices array
        };

        this.questions.push(newQuestion);
    }

    addChoice(question: unknown) {
        if (question.choices.length < 4) {
            const newChoice = {
                text: '',
                selectedChoice: '',
            };
            question.choices.push(newChoice);
        }
    }
}
