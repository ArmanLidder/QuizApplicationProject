import { Injectable } from '@angular/core';
import { Quiz, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';

@Injectable({
    providedIn: 'root',
})
export class GameTestService {
    quiz: Quiz;
    timer: number = 0;
    question: QuizQuestion | null = null;
    isLast: boolean = false;
    locked: boolean = false;
    validated: boolean = false;
    answers: Map<number, string | null> = new Map();
    currQuestionIndex: number = 0;

    constructor(private quizService: QuizService) {}

    getQuiz(quizId: string) {
        this.quizService.basicGetById(quizId).subscribe((quiz: Quiz) => {
            this.quiz = quiz;
            this.question = this.quiz.questions[this.currQuestionIndex];
        })
    }

    startQuestionTimer() {
        //
    }

    next() {
        this.currQuestionIndex++;
        this.question = this.quiz.questions[this.currQuestionIndex];
    }

    updateScore() {
        // TODO
    }

    private reset() {
        // TODO
    }
}
