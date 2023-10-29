import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute } from '@angular/router';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent {
    roomId: string | null;
    isBonus: boolean;
    playerScore: number;
    isTransition: boolean = false;
    isGameLocked: boolean = false;
    private route: ActivatedRoute;

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
    ) {
        this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
        this.configureBaseSocketFeatures();
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
