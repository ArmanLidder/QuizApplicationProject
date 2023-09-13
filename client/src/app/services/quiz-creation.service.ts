import { Injectable } from '@angular/core';

interface FormChoice {
    text: string;
    isRight: boolean;
    isValid: boolean;
}

interface FormQuestion {
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
    gameType: string;

    gameQuestions : FormQuestion;


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
