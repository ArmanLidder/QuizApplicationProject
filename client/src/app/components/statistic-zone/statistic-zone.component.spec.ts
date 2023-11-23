import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticZoneComponent } from './statistic-zone.component';
import {OrganizerHistogramComponent} from "@app/components/organizer-histogram/organizer-histogram.component";
import {mockStats as mockSta} from "@app/components/statistic-zone/statistic-zone.component.const";
import {NgChartsModule} from "ng2-charts";

describe('StatisticZoneComponent', () => {
    let component: StatisticZoneComponent;
    let fixture: ComponentFixture<StatisticZoneComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatisticZoneComponent, OrganizerHistogramComponent],
            imports: [NgChartsModule]
        });
        fixture = TestBed.createComponent(StatisticZoneComponent);
        component = fixture.componentInstance;
        component.gameStats = mockSta;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call setUpData when changes', () => {
        const setUpDataSpy = spyOn<any>(component, 'setUpData');
        component.ngOnInit();
        fixture.detectChanges();
        expect(setUpDataSpy).toHaveBeenCalled();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
