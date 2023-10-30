import { Component, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute } from '@angular/router';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';
import { Score } from '@common/interfaces/score.interface';

@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent implements OnInit {
    // roomId: string | null;
    isBonus: boolean = false;
    playerScore: number = 0;
    isTransition: boolean = false;
    isGameLocked: boolean = false;
    question: QuizQuestion;

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
        this.configureBaseSocketFeatures();
        this.socketService.send('get question', this.gameService.roomId);
    }

    nextQuestion() {
        this.gameService.validated = false;
        this.gameService.locked = false;
        this.socketService.send('start transition', this.gameService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('end question', () => {
            if (this.gameService.username !== 'Organisateur') {
                this.socketService.send('get score', { roomId: this.gameService.roomId, username: this.gameService.username }, (score: Score) => {
                    this.gameService.validated = true;
                    this.playerScore = score.points;
                    this.isBonus = score.isBonus;
                });
            }
        });

        this.socketService.on('time transition', (timeValue: number) => {
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.locked = false;
                this.gameService.validated = false;
                this.isBonus = false;
                this.gameService.currentQuestionIndex++;
                this.socketService.send('next question', this.gameService.roomId);
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
