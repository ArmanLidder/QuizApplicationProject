import { Component, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute } from '@angular/router';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';

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
        console.log(this.gameService.roomId);
        this.configureBaseSocketFeatures();
        this.socketService.send('get question', this.gameService.roomId);
        // this.quizService.basicGetById('1').subscribe((quiz: Quiz) => {
        //     this.gameService.question = quiz.questions[0];
        //     this.gameService.timer = quiz.duration;
        // });
    }

    nextQuestion() {
        this.gameService.validated = false;
        this.gameService.currentQuestionIndex++;
        this.socketService.send('next question', this.gameService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('question round done', (result: { score: number; isBonus: boolean }) => {
            this.isTransition = true;
            this.playerScore = result.score;
            this.isBonus = result.isBonus;
        });

        this.socketService.on('new question', (data: { question: QuizQuestion }) => {
            this.isTransition = false;
            this.isGameLocked = false;
            this.gameService.question = data.question;
        });

        this.socketService.on('time transition', (timeValue: number) => {
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) this.isTransition = true;
        });

        this.socketService.on('time question', (timeValue: number) => {
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) this.gameService.sendAnswer();
        });

        this.socketService.on('end game', () => {
            // navigate to result view
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
