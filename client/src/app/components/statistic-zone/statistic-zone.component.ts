import { Component } from '@angular/core';
import { ResponsesValues, ResponsesNumber } from '@app/components/organizer-histogram/organizer-histogram.component.const';

type QuestionStatistics = [ResponsesValues, ResponsesNumber];
@Component({
    selector: 'app-statistic-zone',
    templateUrl: './statistic-zone.component.html',
    styleUrls: ['./statistic-zone.component.scss'],
})
export class StatisticZoneComponent {
    statistics: Map<string, QuestionStatistics>;

}
