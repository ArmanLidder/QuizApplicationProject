import { Component, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportStatsFormat } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { MAX_PERCENTAGE } from '@app/components/game-interface/game-interface.component.const';
import { HOST_USERNAME } from '@common/names/host-username';

type Player = [string, number];

@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent {
    @ViewChild('playerListChild') playerListComponent: PlayerListComponent;

    isBonus: boolean = false;
    isGameOver: boolean = false;
    playerScore: number = 0;
    timerText: string = timerMessage.timeLeft;
    players: Player[] = [];
    gameService: GameService;
    inPanicMode: boolean;
    gameStats: QuestionStatistics[] = [];
    private readonly socketService: SocketClientService;
    private route: ActivatedRoute;
    private router: Router;

    constructor(injector: Injector) {
        this.gameService = injector.get<GameService>(GameService);
        this.socketService = injector.get<SocketClientService>(SocketClientService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.router = injector.get<Router>(Router);
        this.gameService.isTestMode = this.route.snapshot.url[0].path === 'quiz-testing-page';
        if (this.gameService.isTestMode) {
            if (this.socketService.isSocketAlive()) this.socketService.disconnect();
        }
        const pathId = this.route.snapshot.paramMap.get('id') as string;
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(pathId);
    }

    get score() {
        this.playerScore = this.gameService.isTestMode ? this.gameService.playerScore : this.playerScore;
        return this.playerScore;
    }

    get bonusStatus() {
        this.isBonus = this.gameService.isTestMode ? this.gameService.isBonus : this.isBonus;
        return this.isBonus;
    }
    private configureBaseSocketFeatures() {
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

        this.socketService.on(socketEvent.EVALUATION_OVER, () => {
            this.getScore();
        });

        this.socketService.on(socketEvent.TIME_TRANSITION, (timeValue: number) => {
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.audio.pause();
                this.gameService.audio.currentTime = 0;
                this.gameService.gameRealService.audioPaused = false;
                this.inPanicMode = false;
                this.gameService.gameRealService.locked = false;
                this.gameService.gameRealService.validated = false;
                this.isBonus = false;
                this.timerText = timerMessage.timeLeft;
            }
        });

        this.socketService.on(socketEvent.FINAL_TIME_TRANSITION, (timeValue: number) => {
            this.timerText = timerMessage.finalResult;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.playerListComponent.getPlayersList();
            }
        });

        this.socketService.on(socketEvent.REMOVED_FROM_GAME, () => {
            this.router.navigate(['/']);
        });

        this.socketService.on(socketEvent.PANIC_MODE, () => {
            if (this.gameService.timer > 0 && !this.gameService.gameRealService.audioPaused) {
                this.gameService.audio.play();
            }
            this.inPanicMode = true;
        });

        this.socketService.on(socketEvent.PAUSE_TIMER, () => {
            if (this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.play();
            } else if (!this.gameService.gameRealService.audioPaused && this.inPanicMode) {
                this.gameService.audio.pause();
            }
            this.gameService.gameRealService.audioPaused = !this.gameService.gameRealService.audioPaused;
        });

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


    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
