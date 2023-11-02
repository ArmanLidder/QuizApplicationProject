import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';
import { Score } from '@common/interfaces/score.interface';

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

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.gameService.isTestMode = this.route.snapshot.url[0].path === 'quiz-testing-page';
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
        this.socketService.on('end question', () => {
            if (this.gameService.gameRealService.username !== 'Organisateur') {
                this.socketService.send(
                    'get score',
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

        this.socketService.on('time transition', (timeValue: number) => {
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.gameRealService.locked = false;
                this.gameService.gameRealService.validated = false;
                this.isBonus = false;
                this.timerText = 'Temps restant';
            }
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = "Les résultats finaux s'afficherons dans:";
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });

        this.socketService.on('removed from game', () => {
            this.router.navigate(['/']).then();
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
