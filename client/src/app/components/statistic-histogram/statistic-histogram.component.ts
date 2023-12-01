import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ResponsesValues, ResponsesNumber } from '@app/components/statistic-histogram/statistic-histogram.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { QuestionType } from '@common/enums/question-type.enum';

@Component({
    selector: 'app-statistic-histogram',
    templateUrl: './statistic-histogram.component.html',
    styleUrls: ['./statistic-histogram.component.scss'],
})
export class StatisticHistogramComponent implements OnChanges {
    @Input() changingResponses: ResponsesNumber;
    @Input() valueOfResponses: ResponsesValues;
    @Input() isGameOver: boolean = false;
    legendLabels: string[] = [];
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

    constructor(private gameService: GameService) {}

    ngOnChanges() {
        const labels = Array.from(this.valueOfResponses.keys());
        const changingResponsesData = [];
        if (this.isGameOver) {
            this.legendLabels[0] = 'Mauvaises réponses';
            this.legendLabels[1] = 'Bonnes réponses';
        } else {
            this.legendLabels[0] = this.gameService.question?.type === QuestionType.QLR ? 'Inactif' : 'Mauvaises réponses';
            this.legendLabels[1] = this.gameService.question?.type === QuestionType.QLR ? 'Actif' : 'Bonnes réponses';
        }

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
