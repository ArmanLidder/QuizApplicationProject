import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticHistogramComponent } from './statistic-histogram.component';
import { NgChartsModule } from 'ng2-charts';

const HISTOGRAM_VALUE_PLAYER_ONE = 15;
const HISTOGRAM_VALUE_PLAYER_TWO = 5;
const HISTOGRAM_VALUE_PLAYER_THREE = 8;

describe('OrganizerHistogramComponent', () => {
    let component: StatisticHistogramComponent;
    let fixture: ComponentFixture<StatisticHistogramComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatisticHistogramComponent],
            imports: [NgChartsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(StatisticHistogramComponent);
        component = fixture.componentInstance;

        component.changingResponses = new Map<string, number>([
            ['Paris', HISTOGRAM_VALUE_PLAYER_ONE],
            ['Dollar', HISTOGRAM_VALUE_PLAYER_TWO],
            ['Pound', HISTOGRAM_VALUE_PLAYER_THREE],
        ]);
        component.valueOfResponses = new Map<string, boolean>([
            ['Paris', true],
            ['Dollar', false],
            ['Pound', true],
        ]);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change barChartData on change', () => {
        fixture.detectChanges();
        component.changingResponses = new Map<string, number>([
            ['Paris', HISTOGRAM_VALUE_PLAYER_ONE],
            ['Dollar', HISTOGRAM_VALUE_PLAYER_TWO],
            ['Pound', HISTOGRAM_VALUE_PLAYER_THREE],
        ]);
        component.ngOnChanges();
        expect(component.barChartData.labels).toEqual(['Paris', 'Dollar', 'Pound']);
        expect(component.barChartData.datasets[0].data).toEqual([
            HISTOGRAM_VALUE_PLAYER_ONE,
            HISTOGRAM_VALUE_PLAYER_TWO,
            HISTOGRAM_VALUE_PLAYER_THREE,
        ]);
    });

    it('should change barChartData on clear change', () => {
        fixture.detectChanges();
        component.changingResponses = new Map<string, number | undefined>([
            ['Paris', undefined],
            ['Dollar', undefined],
            ['Pound', undefined],
        ]) as Map<string, number>;
        component.ngOnChanges();
        expect(component.barChartData.labels?.length).toEqual(3);
        expect(component.barChartData.datasets[0].data?.length).toEqual(3);
    });
});
