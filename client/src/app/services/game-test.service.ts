import { Injectable } from '@angular/core';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { Timer } from '@app/classes/timer';
import { TimeService } from '@app/services/time.service';

const BONUS_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class GameTestService {
    quiz: Quiz;
    isBonus: boolean;
    timer: Timer;
    playerScore: number = 0;
    question: QuizQuestion | null = null;
    answers: Map<number, string | null> = new Map();
    currQuestionIndex: number = 0;

    constructor(
        public timeService: TimeService,
        private quizService: QuizService,
    ) {}

    getQuiz(quizId: string) {
        return this.quizService.basicGetById(quizId);
    }

    next() {
        if (this.timeService.getTimer(0)) {
            if (this.currQuestionIndex === this.quiz.questions.length - 1) return false;
            this.currQuestionIndex++;
            this.question = this.quiz.questions[this.currQuestionIndex];
        }
        return true;
    }

    updateScore(answers: Map<number, string | null>) {
        const choices = this.quiz.questions[this.currQuestionIndex].choices as QuizChoice[];
        const correctChoices = this.extractCorrectChoices(choices);
        const questionPoints = this.quiz.questions[this.currQuestionIndex].points;

        if (answers.size !== correctChoices?.length) {
            this.isBonus = false;
            return;
        }

        for (const [key, value] of answers) {
            if (!choices[key] || choices[key].text !== value || !choices[key].isCorrect) {
                this.isBonus = false;
                return;
            }
        }
        this.isBonus = true;
        this.playerScore += questionPoints * BONUS_MULTIPLIER;
    }

    startTimer(duration: number) {
        if (this.timeService.timersArray[0]) {
            this.timeService.deleteAllTimers();
        }
        this.timer = this.timeService.createTimer(duration);
        this.timeService.startTimer(0);
    }

    reset() {
        this.timeService.deleteAllTimers();
        this.playerScore = 0;
        this.currQuestionIndex = 0;
        this.isBonus = false;
    }

    private extractCorrectChoices(choices?: QuizChoice[]) {
        return choices?.filter((choice: QuizChoice) => choice.isCorrect);
    }
}
