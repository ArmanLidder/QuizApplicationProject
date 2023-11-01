import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';

@Injectable({
    providedIn: 'root',
})
export class GameTestService {
    username: string = '';
    roomId: number = 0;
    timer: number = 0;
    question: QuizQuestion | null = null;
    isLast: boolean = false;
    locked: boolean = false;
    validated: boolean = false;
    answers: Map<number, string | null> = new Map();
    currQuestionIndex: number = 1;

    constructor(private quizService: QuizService) {
        // TODO
    }

    updateScore() {
        // TODO
    }

    private reset() {
        // TODO
    }
}
