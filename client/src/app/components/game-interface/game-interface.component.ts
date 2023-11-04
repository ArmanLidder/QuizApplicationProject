import { Component, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
import { Score } from '@common/interfaces/score.interface';

type PlayerArray = [string, number];

@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent {
    isBonus: boolean = false;
    isGameOver: boolean = false;
    playerScore: number = 0;
    timerText: string = 'Temps restant';
    question: QuizQuestion;
    gameService: GameService;
    players: PlayerArray[] = [];
    private readonly socketService: SocketClientService;
    private route: ActivatedRoute;
    private router: Router;

    constructor(injector: Injector) {
        this.gameService = injector.get<GameService>(GameService);
        this.socketService = injector.get<SocketClientService>(SocketClientService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.router = injector.get<Router>(Router);
        this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init();
    }

    playersData() {
        this.socketService.send('gather players username', this.gameService.roomId, (players: string[]) => {
            for (const player of players) {
                this.socketService.send(
                    'get score',
                    {
                        roomId: this.gameService.roomId,
                        username: player,
                    },
                    (score: Score) => {
                        this.players.push([player, score.points]);
                    },
                );
            }
            this.players.sort((a, b) => b[1] - a[1]);
        });
        this.isGameOver = true;
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('end question', () => {
            if (this.gameService.username !== 'Organisateur') {
                this.socketService.send(
                    'get score',
                    {
                        roomId: this.gameService.roomId,
                        username: this.gameService.username,
                    },
                    (score: Score) => {
                        this.gameService.validated = true;
                        this.playerScore = score.points;
                        this.isBonus = score.isBonus;
                    },
                );
            }
        });

        this.socketService.on('time transition', (timeValue: number) => {
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.locked = false;
                this.gameService.validated = false;
                this.isBonus = false;
                this.timerText = 'Temps restant';
            }
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = "Les résultats finaux s'afficherons dans:";
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.playersData();
            }
        });

        this.socketService.on('removed from game', () => {
            this.router.navigate(['/']);
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
