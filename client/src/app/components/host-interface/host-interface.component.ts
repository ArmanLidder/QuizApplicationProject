import { QuestionType } from '@common/interfaces/quiz.interface';
import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute } from '@angular/router';
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
        this.gameService.roomId = Number(this.route.snapshot.paramMap.get('id'));
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init();
        // console.log(this.gameService.validated);
        // console.log(this.gameService.isLast);
    }

    isDisabled() {
        return !(this.gameService.locked && this.gameService.validated);
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
                this.socketService.send('next question', this.gameService.roomId);
                this.timerText = 'Temps restant';
            }
        });

        this.socketService.on('final time transition', (timeValue: number) => {
            this.timerText = 'Résultat disponible dans ';
            this.gameService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
