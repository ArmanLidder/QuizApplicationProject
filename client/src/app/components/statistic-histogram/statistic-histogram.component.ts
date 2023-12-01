import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ResponsesValues, ResponsesNumber } from '@app/components/statistic-histogram/statistic-histogram.component.const';

@Component({
    selector: 'app-statistic-histogram',
    templateUrl: './statistic-histogram.component.html',
    styleUrls: ['./statistic-histogram.component.scss'],
})
export class StatisticHistogramComponent implements OnChanges {
    @Input() changingResponses: ResponsesNumber;
    @Input() valueOfResponses: ResponsesValues;
    barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
        },
    };
    barChartType: ChartType = 'bar';
    barChartData: ChartData<'bar'>;

    ngOnChanges() {
        const labels = Array.from(this.valueOfResponses.keys());
        const changingResponsesData = [];

        for (const key of labels) {
            changingResponsesData.push(this.changingResponses.get(key) ?? 0);
        }

        const changingResponseColors = labels.map((label) => (this.valueOfResponses.get(label) ? 'lightgreen' : 'red'));

        this.barChartData = {
            labels,
            datasets: [
                {
                    data: changingResponsesData,
                    backgroundColor: changingResponseColors,
                },
            ],
        };
    }
}
