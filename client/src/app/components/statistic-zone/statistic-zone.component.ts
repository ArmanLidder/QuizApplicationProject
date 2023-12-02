import { Component, Input, OnInit } from '@angular/core';
import { ResponsesValues, ResponsesNumber } from '@app/components/statistic-histogram/statistic-histogram.component.const';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';

@Component({
    selector: 'app-statistic-zone',
    templateUrl: './statistic-zone.component.html',
    styleUrls: ['./statistic-zone.component.scss'],
})
export class StatisticZoneComponent implements OnInit {
    @Input() gameStats: QuestionStatistics[];
    currentStat: QuestionStatistics;
    responseValue: ResponsesValues = new Map<string, boolean>();
    responseNumber: ResponsesNumber = new Map<string, number>();
    question: QuizQuestion | undefined;
    index: number = 0;

    ngOnInit() {
        if (this.gameStats.length !== 0) {
            this.currentStat = this.gameStats[this.index];
            this.setUpData();
        }
    }

    next() {
        this.currentStat = this.gameStats[++this.index];
        this.setUpData();
    }

    previous() {
        this.currentStat = this.gameStats[--this.index];
        this.setUpData();
    }

    isEnd() {
        return this.gameStats.length !== 0 ? this.index === this.gameStats.length - 1 : true;
    }

    isFirst() {
        return this.index === 0;
    }

    private setUpData() {
        this.responseValue = this.currentStat[0];
        this.responseNumber = this.currentStat[1];
        this.question = this.currentStat[2];
    }
}
