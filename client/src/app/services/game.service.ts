import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameTestService } from '@app/services/game-test.service';

type Score = Map<string, number>;
const TESTING_TRANSITION_TIMER = 3;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    timeouts: number[] = [0, 0];
    quizId: string;

    isInputFocused: boolean = false;
    username: string = '';
    roomId: number = 0;
    timer: number = 0;
    question: QuizQuestion | null = null;
    isLast: boolean = false;
    locked: boolean = false;
    validated: boolean = false;
    players: Map<string, Score> = new Map();
    answers: Map<number, string | null> = new Map();
    questionNumber: number = 1;

    constructor(
        public socketService: SocketClientService,
        public gameTestService: GameTestService,
    ) {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSockets();
        }
    }

    get testTimer() {
        return this.gameTestService.timer?.time;
    }

    get testPlayerScore() {
        return this.gameTestService.playerScore;
    }

    get testIsBonus() {
        return this.gameTestService.isBonus;
    }

    destroy() {
        this.reset();
        if (this.socketService.isSocketAlive()) this.socketService.socket.offAny();
    }

    init() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSockets();
            this.socketService.send('get question', this.roomId);
        } else {
            this.gameTestService.getQuiz(this.quizId).subscribe((quiz) => {
                this.gameTestService.quiz = quiz;
                this.gameTestService.question = quiz.questions[this.gameTestService.currQuestionIndex];
                this.question = this.gameTestService.question;
                this.gameTestService.timeService.deleteAllTimers();
                this.gameTestService.startTimer(this.gameTestService.quiz.duration);
                this.handleQuestionTimer();
            });
        }
    }

    selectChoice(index: number) {
        if (!this.locked) {
            if (this.answers.has(index)) {
                this.answers.delete(index);
            } else {
                const textChoice = this.question?.choices ? this.question.choices[index].text : null;
                this.answers.set(index, textChoice);
            }
        }
    }

    sendAnswer() {
        const answers = Array.from(this.answers.values());
        if (this.socketService.isSocketAlive()) {
            this.socketService.send('submit answer', {
                roomId: this.roomId,
                answers,
                timer: this.timer,
                username: this.username,
            });
        } else {
            this.validated = true;
            this.locked = true;
            clearTimeout(this.timeouts[0]);
            this.gameTestService.updateScore(this.answers);
            this.gameTestService.startTimer(TESTING_TRANSITION_TIMER);
            this.handleTransitionTimer();
        }
        this.locked = true;
        this.answers.clear();
    }

    configureBaseSockets() {
        this.socketService.on('get initial question', (data: { question: QuizQuestion; username: string; index: number }) => {
            this.question = data.question;
            this.username = data.username;
        });

        this.socketService.on('get next question', (data: { question: QuizQuestion; index: number; isLast: boolean }) => {
            this.question = data.question;
            this.questionNumber = data.index;
            this.isLast = data.isLast;
            this.validated = false;
            this.locked = false;
        });

        this.socketService.on('time', (timeValue: number) => {
            this.handleTimeEvent(timeValue);
        });
    }

    private handleQuestionTimer() {
        const tick = 1000;
        this.timeouts[0] = window.setTimeout(() => {
            this.sendAnswer();
        }, this.gameTestService.quiz.duration * tick);
    }

    private handleTransitionTimer() {
        const tick = 1000;
        this.timeouts[1] = window.setTimeout(() => {
            this.hideFeedback();
            if (this.gameTestService.next()) {
                this.questionNumber++;
                this.question = this.gameTestService.question;
                this.gameTestService.startTimer(this.gameTestService.quiz.duration);
                this.handleQuestionTimer();
            } else {
                this.showFeedBack();
            }
        }, TESTING_TRANSITION_TIMER * tick);
    }

    private hideFeedback() {
        this.validated = false;
        this.locked = false;
        this.gameTestService.isBonus = false;
    }

    private showFeedBack() {
        this.isLast = true;
        this.validated = true;
        this.locked = true;
    }

    private handleTimeEvent(timeValue: number) {
        this.timer = timeValue;
        if (this.timer === 0 && !this.locked) {
            this.locked = true;
            if (this.username !== 'Organisateur') this.sendAnswer();
        }
    }

    private reset() {
        this.username = '';
        this.roomId = 0;
        this.timer = 0;
        this.question = null;
        this.locked = false;
        this.validated = false;
        this.isLast = false;
        this.players.clear();
        this.answers.clear();
        this.questionNumber = 1;
        clearTimeout(this.timeouts[0]);
        clearTimeout(this.timeouts[1]);
        this.gameTestService.reset();
    }
}
