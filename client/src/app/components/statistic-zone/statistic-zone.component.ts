import {Component, Input, OnInit} from '@angular/core';
import { ResponsesValues, ResponsesNumber } from '@app/components/organizer-histogram/organizer-histogram.component.const';
import { QuizQuestion } from "@common/interfaces/quiz.interface";
import { QuestionStatistics } from "@app/components/statistic-zone/statistic-zone.component.const";

@Component({
    selector: 'app-statistic-zone',
    templateUrl: './statistic-zone.component.html',
    styleUrls: ['./statistic-zone.component.scss'],
})
export class StatisticZoneComponent implements OnInit {

    @Input() gameStats: QuestionStatistics[];
    currentStat: QuestionStatistics;
    responseValue: ResponsesValues;
    responseNumber: ResponsesNumber;
    question: QuizQuestion;
    index: number = 0;

    ngOnInit() {
        this.currentStat = this.gameStats[this.index];
        this.setUpData();
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
        return this.index === this.gameStats.length - 1;
    }

    isFirst() {
        return this.index === 0;
    }

    private setUpData() {
        this.responseValue  =  this.currentStat[0];
        this.responseNumber = this.currentStat[1];
        this.question   = this.currentStat[2];
    }
}
