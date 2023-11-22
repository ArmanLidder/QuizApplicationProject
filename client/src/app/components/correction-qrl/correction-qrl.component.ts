import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FULL, HALF, NULL } from '@app/components/correction-qrl/correction-qrl.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameService } from '@app/services/game.service/game.service';

@Component({
    selector: 'app-correction-qrl',
    templateUrl: './correction-qrl.component.html',
    styleUrls: ['./correction-qrl.component.scss'],
})
export class CorrectionQRLComponent implements OnChanges {
    @Input() reponsesQRL = new Map<string, { answers: string; time: number }>();
    @Input() isHostEvaluating: boolean = false;
    reponsesQRLCorrected = new Map<string, number>();
    usernames: string[] = [];
    answers: string[] = [];
    scores: number[] = [NULL, HALF, FULL];
    isValid: boolean = true;
    currentAnswer: string = '';
    currentUsername: string = '';
    points: number[] = [];
    inputPoint: number = 2;
    indexPlayer: number = -1;
    isCorrectionFinished: boolean = false;

    constructor(
        private socketClientService: SocketClientService,
        private gameService: GameService,
    ) {
        this.initialise();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.reponsesQRL) {
            this.initialise();
        }
    }

    initialise() {
        this.indexPlayer = -1;
        this.reponsesQRL.forEach((value: { answers: string; time: number }, key: string) => {
            this.usernames.push(key);
            this.answers.push(value.answers);
        });
        this.nextAnswer();
    }

    getCorrection(point: number) {
        this.points[this.indexPlayer] = point;
    }

    nextAnswer() {
        this.indexPlayer++;
        if (this.indexPlayer <= this.usernames.length) {
            this.currentAnswer = this.answers[this.indexPlayer];
            this.currentUsername = this.usernames[this.indexPlayer];
        }
    }

    endCorrection() {
        for (let i = 0; i < this.usernames.length; i++) {
            this.reponsesQRLCorrected.set(this.usernames[i], this.points[i]);
        }
    }

    clearAll() {
        this.usernames.splice(0, this.usernames.length);
        this.answers.splice(0, this.answers.length);
        this.points.splice(0, this.points.length);
        this.reponsesQRLCorrected.clear();
    }

    submitPoint() {
        this.isValid = this.scores.includes(Number(this.inputPoint));
        if (this.indexPlayer < this.usernames.length) {
            if (this.isValid) {
                this.getCorrection(this.inputPoint);
                this.nextAnswer();
                this.inputPoint = 2;
            }
            if (this.indexPlayer >= this.usernames.length) {
                this.isCorrectionFinished = true;
                this.endCorrection();
                const playerQrlCorrectionFormatted = JSON.stringify(Array.from(this.reponsesQRLCorrected));
                this.socketClientService.send('playerQrlCorrection', {
                    roomId: this.gameService.gameRealService.roomId,
                    playerCorrection: playerQrlCorrectionFormatted,
                });
                this.isHostEvaluating = false;
                this.clearAll();
            }
        }
    }
}
