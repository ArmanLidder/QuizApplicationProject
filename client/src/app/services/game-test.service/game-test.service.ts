import { Injectable } from '@angular/core';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service/quiz.service';
import { Timer } from '@app/classes/timer/timer';
import { GameServiceInterface } from '@app/interfaces/game-service.interface/game-service.interface';
import { TimeService } from '@app/services/time.service/time.service';

const BONUS_MULTIPLIER = 1.2;
const TESTING_TRANSITION_TIMER = 3;

@Injectable({
    providedIn: 'root',
})
export class GameTestService implements GameServiceInterface {
    timeouts: number[] = [0, 0];
    validated: boolean = false;
    gameOver: boolean = false;
    answers: Map<number, string | null> = new Map();
    locked: boolean = false;
    quiz: Quiz;
    quizId: string = '';
    isBonus: boolean = false;
    timer: Timer;
    playerScore: number = 0;
    question: QuizQuestion | null = null;
    currQuestionIndex: number = 0;

    constructor(
        public timeService: TimeService,
        private quizService: QuizService,
    ) {}

    init() {
        this.getQuiz(this.quizId).subscribe((quiz) => {
            this.quiz = quiz;
            this.question = quiz.questions[this.currQuestionIndex];
            this.timeService.deleteAllTimers();
            this.startTimer(this.quiz.duration);
            this.handleQuestionTimerEnd();
        });
    }

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

    sendAnswer() {
        this.validated = true;
        this.locked = true;
        clearTimeout(this.timeouts[0]);
        this.updateScore(this.answers);
        this.startTimer(TESTING_TRANSITION_TIMER);
        this.handleTransitionTimer();
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
        this.gameOver = false;
        this.locked = false;
        this.validated = false;
        clearTimeout(this.timeouts[0]);
        clearTimeout(this.timeouts[1]);
    }

    private handleQuestionTimerEnd() {
        const tick = 1000;
        this.timeouts[0] = window.setTimeout(() => {
            this.sendAnswer();
        }, this.quiz.duration * tick);
    }

    private handleTransitionTimer() {
        const tick = 1000;
        this.timeouts[1] = window.setTimeout(() => {
            this.hideFeedback();
            if (this.next()) {
                this.startTimer(this.quiz.duration);
                this.handleQuestionTimerEnd();
            } else {
                this.showFinalFeedBack();
            }
        }, TESTING_TRANSITION_TIMER * tick);
    }

    private hideFeedback() {
        this.validated = false;
        this.locked = false;
        this.isBonus = false;
        clearTimeout(this.timeouts[0]);
        clearTimeout(this.timeouts[1]);
        this.answers.clear();
    }

    private showFinalFeedBack() {
        this.validated = true;
        this.locked = true;
        this.gameOver = true;
    }

    private extractCorrectChoices(choices?: QuizChoice[]) {
        return choices?.filter((choice: QuizChoice) => choice.isCorrect);
    }
}
