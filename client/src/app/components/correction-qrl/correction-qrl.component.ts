import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FULL, HALF, INITIAL_ARRAY_VALUE, NULL } from '@app/components/correction-qrl/correction-qrl.component.const';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-correction-qrl',
    templateUrl: './correction-qrl.component.html',
    styleUrls: ['./correction-qrl.component.scss'],
})
export class CorrectionQRLComponent implements OnChanges {
    @Input() gameStats: QuestionStatistics[] = [];
    @Input() qrlAnswers = new Map<string, { answers: string; time: number }>();
    @Input() isHostEvaluating: boolean = false;
    questionStats = new Map<string, number>([
        ['0', 0],
        ['50', 0],
        ['100', 0],
    ]);
    correctedQrlAnswers = new Map<string, number>();
    usernames: string[] = [];
    answers: string[] = [];
    scores: number[] = [NULL, HALF, FULL];
    isValid: boolean = true;
    currentAnswer: string = 'nothing';
    currentUsername: string = 'nothing';
    points: number[] = [];
    inputPoint: number = 0;
    indexPlayer: number = INITIAL_ARRAY_VALUE;
    isCorrectionFinished: boolean = false;

    constructor(
        private socketClientService: SocketClientService,
        private gameService: GameService,
    ) {
        this.initialize();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.qrlAnswers) {
            this.initialize();
            if (this.usernames.length > 0) {
                this.isHostEvaluating = true;
            }
        }
    }

    initialize() {
        this.indexPlayer = -1;
        const sortedMap = new Map([...this.qrlAnswers.entries()].sort((a, b) => a[0].localeCompare(b[0])));
        sortedMap.forEach((value: { answers: string; time: number }, key: string) => {
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
            this.correctedQrlAnswers.set(this.usernames[i], this.points[i]);
            this.questionStats.set(String(this.points[i]), (this.questionStats.get(String(this.points[i])) as number) + 1);
        }
        const emptyMap = new Map<string, boolean>([
            ['0', false],
            ['50', false],
            ['100', true],
        ]);
        const newQuestionMap = new Map(this.questionStats);
        this.gameStats.push([emptyMap, newQuestionMap, this.gameService.gameRealService.question as QuizQuestion]);
    }

    clearAll() {
        this.usernames.splice(0, this.usernames.length);
        this.answers.splice(0, this.answers.length);
        this.points.splice(0, this.points.length);
        this.correctedQrlAnswers.clear();
        this.questionStats = new Map<string, number>([
            ['0', 0],
            ['50', 0],
            ['100', 0],
        ]);
        this.indexPlayer = -1;
    }

    submitPoint() {
        this.isValid = this.scores.includes(Number(this.inputPoint));
        if (this.indexPlayer < this.usernames.length) {
            if (this.isValid) {
                this.getCorrection(this.inputPoint);
                this.nextAnswer();
                this.inputPoint = 0;
            }
            if (this.indexPlayer >= this.usernames.length) {
                this.isCorrectionFinished = true;
                this.endCorrection();
                const playerQrlCorrectionFormatted = JSON.stringify(Array.from(this.correctedQrlAnswers));
                this.socketClientService.send(socketEvent.PLAYER_QRL_CORRECTION, {
                    roomId: this.gameService.gameRealService.roomId,
                    playerCorrection: playerQrlCorrectionFormatted,
                });
                this.isHostEvaluating = false;
                this.clearAll();
            }
        }
    }
}
