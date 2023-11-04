import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';
import { QuestionType, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';
import { Score } from '@common/interfaces/score.interface';

type PlayerArray = [string, number, number];

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
    timerText: string = 'Temps restant';
    isGameOver: boolean = false;
    histogramDataChangingResponses = new Map<string, number>();
    histogramDataValue = new Map<string, boolean>();
    players: PlayerArray[] = [];

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
    ) {
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(this.route.snapshot.paramMap.get('id') as string);
    }

    playersUsername() {
        if (this.players) {
            this.players = [];
        }
        this.socketService.send('gather players username', this.gameService.gameRealService.roomId, (players: string[]) => {
            for (const player of players) {
                this.socketService.send(
                    'get score',
                    {
                        roomId: this.gameService.gameRealService.roomId,
                        username: player,
                    },
                    (score: Score) => {
                        this.players.push([player, score.points, score.bonusCount]);
                        this.players.sort((a, b) => {
                            if (b[1] - a[1] !== 0) {
                                return b[1] - a[1];
                            }
                            return a[0].localeCompare(b[0]);
                        });
                    },
                );
            }
        });
    }

    isDisabled() {
        return !this.gameService.gameRealService.locked && !this.gameService.gameRealService.validated;
    }

    updateHostCommand() {
        return this.gameService.gameRealService.isLast ? 'Montrer résultat' : 'Prochaine question';
    }

    handleHostCommand() {
        if (this.gameService.gameRealService.isLast) {
            this.handleLastQuestion();
        } else {
            this.nextQuestion();
        }
    }

    private nextQuestion() {
        this.gameService.gameRealService.validated = false;
        this.gameService.gameRealService.locked = false;
        this.socketService.send('start transition', this.gameService.gameRealService.roomId);
    }

    private handleLastQuestion() {
        this.socketService.send('show result', this.gameService.gameRealService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('time transition', (timeValue: number) => {
            this.timerText = 'Prochaine question dans ';
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.gameRealService.locked = true;
                this.gameService.gameRealService.validated = true;
                this.socketService.send('next question', this.gameService.gameRealService.roomId);
                this.timerText = 'Temps restant';
            }
        });

        this.socketService.on('end question', () => {
            this.playersUsername();
            this.gameService.gameRealService.validated = true;
            this.gameService.gameRealService.locked = true;
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = 'Résultat disponible dans ';
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });
        this.socketService.on('refresh choices stats', (choicesStatsValue: number[]) => {
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
        });

        this.socketService.on(
            'get initial question',
            (data: { question: QuizQuestion; username: string; index: number; numberOfQuestions: number }) => {
                this.playersUsername();
                this.initGraph(data.question);
            },
        );

        this.socketService.on('get next question', (data: { question: QuizQuestion; index: number; isLast: boolean }) => {
            this.initGraph(data.question);
        });
    }

    private initGraph(question: QuizQuestion) {
        this.histogramDataValue = new Map();
        this.histogramDataChangingResponses = new Map();
        question.choices?.forEach((choice: QuizChoice) => {
            this.histogramDataValue.set(choice.text, choice.isCorrect as boolean);
        });
    }

    private createChoicesStatsMap(choicesStatsValue: number[]) {
        const choicesStats = new Map();
        const choices = this.gameService.question?.choices;
        choices?.forEach((choice: QuizChoice, index: number) => choicesStats.set(choice.text, choicesStatsValue[index]));
        return choicesStats;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
