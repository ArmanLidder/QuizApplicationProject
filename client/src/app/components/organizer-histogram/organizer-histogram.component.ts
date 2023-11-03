import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-organizer-histogram',
  templateUrl: './organizer-histogram.component.html',
  styleUrls: ['./organizer-histogram.component.scss'],
})
export class OrganizerHistogramComponent implements OnChanges {
  // @Input() finalResponses: Map<string, number>;
  @Input() changingResponses: Map<string, number>;
  @Input() valueOfResponses: Map<string, boolean>;
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
    console.log(this.changingResponses);
    console.log(this.valueOfResponses);
    const labels = Array.from(this.valueOfResponses.keys());
    // const finalChoicesData = [];
    const changingResponsesData = [];

    for (const key of labels) {
      // finalChoicesData.push(this.finalResponses.get(key) || 0);
      changingResponsesData.push(this.changingResponses.get(key) || 0);
    }

    // const finalResponseColors = labels.map(
    //     (label) => this.valueOfResponses.get(label) ? 'green' : 'red',
    // );

    const changingResponseColors = labels.map(
        (label) => (this.valueOfResponses.get(label) ? 'lightgreen' : 'pink'), // Lighter shades for changing responses
    );

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
