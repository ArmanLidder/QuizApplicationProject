import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { QuestionType, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
    timerText: string = 'Temps restant';
    isGameOver: boolean = false;
    // histogramData = new Map<string, number>();
    histogramDataChangingResponses = new Map<string, number>();
    histogramDataValue = new Map<string, boolean>();

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
    ) {
        this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init();
    }

    isDisabled() {
        return !this.gameService.locked && !this.gameService.validated;
    }

    updateHostCommand() {
        return this.gameService.isLast ? 'Montrer résultat' : 'Prochaine question';
    }

    handleHostCommand() {
        if (this.gameService.isLast) {
            this.handleLastQuestion();
        } else {
            this.nextQuestion();
        }
    }

    private nextQuestion() {
        this.gameService.validated = false;
        this.gameService.locked = false;
        this.socketService.send('start transition', this.gameService.roomId);
    }

    private handleLastQuestion() {
        this.socketService.send('show result', this.gameService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('time transition', (timeValue: number) => {
            this.timerText = 'Prochaine question dans ';
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.locked = true;
                this.gameService.validated = true;
                this.socketService.send('next question', this.gameService.roomId);
                this.timerText = 'Temps restant';
            }
        });

        this.socketService.on('get initial question', (data: { question: QuizQuestion; username: string; index: number; numberOfQuestions: number }) => {
            this.initGraph(data.question);
        });

        this.socketService.on('get next question', (data: { question: QuizQuestion; index: number; isLast: boolean }) => {
            console.log('next question received');
            this.initGraph(data.question);
        });

        this.socketService.on('end question', () => {
            console.log('end question')
            this.gameService.validated = true;
            this.gameService.locked = true;
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = 'Résultat disponible dans ';
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });

        this.socketService.on('refresh choices stats', (choicesStatsValue: number[]) => {
            console.log('refresh choices');
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
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
