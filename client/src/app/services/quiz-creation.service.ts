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

    gameQuestions: FormQuestion[] = [
        {
            gameType: 'QCM',
            text: 'What is the capital of France?',
            points: 10,
            choices: [
                { text: 'Paris', isRight: true, isValid: true },
                { text: 'Berlin', isRight: false, isValid: false },
                { text: 'London', isRight: false, isValid: false },
            ],
            selectedChoices: [],
            isValid: false,
        },
        {
            gameType: 'QCM',
            text: 'Which planet is known as the Red Planet?',
            points: 5,
            choices: [
                { text: 'Mars', isRight: true, isValid: true },
                { text: 'Venus', isRight: false, isValid: false },
                { text: 'Jupiter', isRight: false, isValid: false },
            ],
            selectedChoices: [],
            isValid: false,
        },
    ];

    /*
     * liste de questions
     * removeQuestion()
     * addQuestion()
     * modifiyQuestion()
     * saveQuestion() verifier si valide apres ca l'ajoute
     * saveGame() verifie si game valide apres ca l'ajoute
     * verifiyGameName verifiyGameDesc verifiyGameResponseTime
     * swapQuestion(index 1, index 2)
     * */
}
