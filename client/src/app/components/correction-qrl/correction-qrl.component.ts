import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-correction-qrl-list',
    templateUrl: './correction-qrl.component.html',
    styleUrls: ['./correction-qrl.component.scss'],
})
export class CorrectionQRLComponent {
    @Input() reponsesQRL = new Map<string, string>();
    reponsesQRLCorrected = new Map<string, number>();
    usernames: string[] = [];
    answers: string[] = [];
    scores: number[] = [0, 50, 100];
    isValid: boolean = true;
    currentAnswer: string = "";
    currentUsername: string = "";
    points: number[] = [];
    inputPoint: number = 2;
    indexPlayer: number = 0;
    isCorrectionFinished: boolean = false;

    constructor() {
        this.initialise();
    }

    initialise() {
        this.reponsesQRL.forEach((value: string, key: string) => {
            this.usernames.push(key);
            this.answers.push(value);
        });
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

    submitPoint() {
        this.isValid = this.scores.includes(this.inputPoint);
        if (this.indexPlayer <= this.usernames.length) {
            if (this.isValid) {
                this.getCorrection(this.inputPoint);
                this.nextAnswer();
                this.inputPoint = 2;
            }
            if (this.indexPlayer > this.usernames.length) {
                this.isCorrectionFinished = true;
                this.endCorrection();
                console.log(this.reponsesQRLCorrected);
            }
        }
    }
}
