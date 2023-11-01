import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
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
    question: QuizQuestion;
    isTestMode: boolean;

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.isTestMode = this.route.snapshot.url[0].path === 'quiz-testing-page';
        if (this.socketService.isSocketAlive()) {
            this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
            this.configureBaseSocketFeatures();
        } else {
            this.gameService.quizId = this.route.snapshot.paramMap.get('id') as string;
        }
        this.gameService.init();
    }

    get timer() {
        return this.isTestMode ? this.gameService.testTimer : this.gameService.timer;
    }

    get score() {
        return this.isTestMode ? this.gameService.testPlayerScore : this.playerScore;
    }

    get bonusStatus() {
        return this.isTestMode ? this.gameService.testIsBonus : this.isBonus;
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
            if (this.gameService.timer === 0) this.isGameOver = true;
        });

        this.socketService.on('removed from game', () => {
            this.router.navigate(['/']);
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
