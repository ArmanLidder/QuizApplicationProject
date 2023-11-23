import { Injectable } from '@angular/core';
import { GameTestService } from '@app/services/game-test.service/game-test.service';
import { GameRealService } from '@app/services/game-real.service/game-real.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    isTestMode: boolean = false;
    isInputFocused: boolean = false;
    answers: Map<number, string | null> = new Map();
    qrlAnswer: string = '';
    isHostEvaluating: boolean = false;

    constructor(
        public gameTestService: GameTestService,
        public gameRealService: GameRealService,
        private socketService: SocketClientService,
    ) {
        if (socketService.isSocketAlive()) this.configureBaseSockets();
    }

    get timer() {
        return this.isTestMode ? this.gameTestService.timer?.time : this.gameRealService.timer;
    }

    get playerScore() {
        return this.gameTestService.playerScore;
    }

    get isBonus() {
        return this.gameTestService.isBonus;
    }

    get question() {
        return this.isTestMode ? this.gameTestService.question : this.gameRealService.question;
    }

    get questionNumber() {
        return this.isTestMode ? this.gameTestService.currQuestionIndex + 1 : this.gameRealService.questionNumber;
    }

    get username() {
        return this.gameRealService.username;
    }

    get lockedStatus() {
        return this.isTestMode ? this.gameTestService.locked : this.gameRealService.locked;
    }

    get validatedStatus() {
        return this.isTestMode ? this.gameTestService.validated : this.gameRealService.validated;
    }

    destroy() {
        this.reset();
        this.answers.clear();
    }

    init(pathId: string) {
        if (!this.isTestMode) {
            this.gameRealService.roomId = Number(pathId);
            this.gameRealService.init();
        } else {
            this.gameTestService.quizId = pathId;
            this.gameTestService.init();
        }
    }

    selectChoice(index: number) {
        if (!this.lockedStatus) {
            if (this.answers.has(index)) {
                this.answers.delete(index);
                this.gameRealService.sendSelection(index, false);
            } else {
                const textChoice = this.question?.choices ? this.question.choices[index].text : null;
                this.answers.set(index, textChoice);
                this.gameRealService.sendSelection(index, true);
            }
        }
    }

    sendAnswer() {
        if (!this.isTestMode) {
            this.gameRealService.answers = this.answers;
            this.gameRealService.qrlAnswer = this.qrlAnswer;
            this.gameRealService.sendAnswer();
        } else {
            this.gameTestService.answers = this.answers;
            this.gameRealService.qrlAnswer = this.qrlAnswer;
            this.qrlAnswer = '';
            this.gameTestService.sendAnswer();
        }
        this.answers.clear();
    }

    private reset() {
        this.gameRealService.destroy();
        this.gameTestService.reset();
    }

    private configureBaseSockets() {
        this.socketService.on(socketEvent.time, (timeValue: number) => {
            this.handleTimeEvent(timeValue);
        });
    }

    private handleTimeEvent(timeValue: number) {
        this.gameRealService.timer = timeValue;
        if (this.timer === 0 && !this.gameRealService.locked) {
            this.gameRealService.locked = true;
            if (this.username !== 'Organisateur') this.sendAnswer();
        }
    }
}
