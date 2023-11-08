import { Component, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType } from '@common/enums/question-type.enum';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';

type PlayerArray = [string, number];

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
    players: PlayerArray[] = [];
    gameService: GameService;
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
        this.socketService.on(socketEvent.endQuestion, () => {
            if (this.gameService.gameRealService.username !== 'Organisateur') {
                this.socketService.send(
                    socketEvent.getScore,
                    {
                        roomId: this.gameService.gameRealService.roomId,
                        username: this.gameService.gameRealService.username,
                    },
                    (score: Score) => {
                        this.gameService.gameRealService.validated = true;
                        this.playerScore = score.points;
                        this.isBonus = score.isBonus;
                    },
                );
            }
        });

        this.socketService.on(socketEvent.timeTransition, (timeValue: number) => {
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.gameRealService.locked = false;
                this.gameService.gameRealService.validated = false;
                this.isBonus = false;
                this.timerText = timerMessage.timeLeft;
            }
        });

        this.socketService.on(socketEvent.finalTimeTransition, (timeValue: number) => {
            this.timerText = timerMessage.finalResult;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.playerListComponent.getPlayersList();
            }
        });

        this.socketService.on(socketEvent.removedFromGame, () => {
            this.router.navigate(['/']);
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
