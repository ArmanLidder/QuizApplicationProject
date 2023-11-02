import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';
import { QuestionType } from '@common/interfaces/quiz.interface';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
    timerText: string = 'Temps restant';
    isGameOver: boolean = false;

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
    ) {
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(this.route.snapshot.paramMap.get('id') as string);
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
            this.gameService.gameRealService.validated = true;
            this.gameService.gameRealService.locked = true;
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = 'Résultat disponible dans ';
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
