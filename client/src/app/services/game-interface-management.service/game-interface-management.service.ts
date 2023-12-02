import { Injectable } from '@angular/core';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Router } from '@angular/router';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionType } from '@common/enums/question-type.enum';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { HOST_USERNAME } from '@common/names/host-username';
import { Score } from '@common/interfaces/score.interface';
import { MAX_PERCENTAGE } from '@app/components/game-interface/game-interface.component.const';
import { TransportStatsFormat } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';

type Player = [string, number];

@Injectable({
    providedIn: 'root',
})
export class GameInterfaceManagementService {
    isBonus: boolean = false;
    isGameOver: boolean = false;
    playerScore: number = 0;
    timerText: string = timerMessage.timeLeft;
    players: Player[] = [];
    inPanicMode: boolean = false;
    gameStats: QuestionStatistics[] = [];
    playerListComponent: PlayerListComponent;

    constructor(
        public gameService: GameService,
        private socketService: SocketClientService,
        private router: Router,
    ) {}

    setup(pathId: string) {
        if (this.gameService.isTestMode) {
            if (this.socketService.isSocketAlive()) this.socketService.disconnect();
        }
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(pathId);
    }

    reset() {
        this.players = [];
        this.isGameOver = false;
        this.playerScore = 0;
        this.gameStats = [];
        this.isBonus = false;
        this.inPanicMode = false;
        this.timerText = timerMessage.timeLeft;
        this.gameService.destroy();
    }

    configureBaseSocketFeatures() {
        this.handleEndQuestion();
        this.handleEvaluationOver();
        this.handleTimeTransition();
        this.handleFinalTimeTransition();
        this.handleRemovedFromGame();
        this.handlePanicMode();
        this.handlePauseTimer();
        this.handleGameStatusDistribution();
    }

    private resetData() {
        this.gameService.audio.pause();
        this.gameService.audio.currentTime = 0;
        this.gameService.gameRealService.audioPaused = false;
        this.inPanicMode = false;
        this.gameService.gameRealService.locked = false;
        this.gameService.gameRealService.validated = false;
        this.isBonus = false;
        this.timerText = timerMessage.timeLeft;
    }

    private handleEndQuestion() {
        this.socketService.on(socketEvent.END_QUESTION, () => {
            this.gameService.audio.pause();
            this.gameService.audio.currentTime = 0;
            this.gameService.gameRealService.audioPaused = false;
            this.inPanicMode = false;
            if (this.gameService.question?.type === QuestionType.QCM) {
                this.getScore();
            } else {
                this.gameService.qrlAnswer = '';
                this.gameService.gameRealService.validated = true;
            }
        });
    }

    private handleEvaluationOver() {
        this.socketService.on(socketEvent.EVALUATION_OVER, () => {
            this.getScore();
        });
    }

    private handleTimeTransition() {
        this.socketService.on(socketEvent.TIME_TRANSITION, (timeValue: number) => {
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.resetData();
            }
        });
    }

    private handleFinalTimeTransition() {
        this.socketService.on(socketEvent.FINAL_TIME_TRANSITION, (timeValue: number) => {
            this.timerText = timerMessage.finalResult;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.playerListComponent.getPlayersList();
            }
        });
    }

    private handleRemovedFromGame() {
        this.socketService.on(socketEvent.REMOVED_FROM_GAME, () => {
            this.router.navigate(['/']);
        });
    }

    private handlePanicMode() {
        this.socketService.on(socketEvent.PANIC_MODE, () => {
            if (this.gameService.timer > 0 && !this.gameService.gameRealService.audioPaused) {
                this.gameService.audio.play();
            }
            this.inPanicMode = true;
        });
    }

    private handlePauseTimer() {
        this.socketService.on(socketEvent.PAUSE_TIMER, () => {
            if (this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.play();
            } else if (!this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.pause();
            }
            this.gameService.gameRealService.audioPaused = !this.gameService.gameRealService.audioPaused;
        });
    }

    private handleGameStatusDistribution() {
        this.socketService.on(socketEvent.GAME_STATUS_DISTRIBUTION, (gameStats: string) => {
            this.unpackStats(this.parseGameStats(gameStats));
        });
    }

    private parseGameStats(stringifyStats: string) {
        return JSON.parse(stringifyStats);
    }

    private unpackStats(stats: TransportStatsFormat) {
        stats.forEach((stat) => {
            const values = new Map<string, boolean>(stat[0]);
            const responses = new Map<string, number>(stat[1]);
            this.gameStats.push([values, responses, stat[2]]);
        });
    }

    private getScore() {
        if (this.gameService.gameRealService.username !== HOST_USERNAME) {
            this.socketService.send(
                socketEvent.GET_SCORE,
                {
                    roomId: this.gameService.gameRealService.roomId,
                    username: this.gameService.gameRealService.username,
                },
                (score: Score) => {
                    this.gameService.gameRealService.validated = true;
                    this.updateScore(score.points);
                    this.isBonus = score.isBonus;
                },
            );
        }
    }

    private updateScore(score: number) {
        const oldScore = this.playerScore;
        this.playerScore = score;
        if (this.gameService.question?.type === QuestionType.QLR) {
            this.gameService.lastQrlScore =
                ((this.playerScore - oldScore) / (this.gameService.gameRealService.question?.points as number)) * MAX_PERCENTAGE;
        }
    }
}
