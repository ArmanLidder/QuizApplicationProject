import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticZoneComponent } from './statistic-zone.component';
import { OrganizerHistogramComponent } from '@app/components/organizer-histogram/organizer-histogram.component';
import { mockStats as mockSta } from '@app/components/statistic-zone/statistic-zone.component.const';
import { NgChartsModule } from 'ng2-charts';

describe('StatisticZoneComponent', () => {
    let component: StatisticZoneComponent;
    let fixture: ComponentFixture<StatisticZoneComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatisticZoneComponent, OrganizerHistogramComponent],
            imports: [NgChartsModule],
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
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const setUpDataSpy = spyOn<any>(component, 'setUpData');
        component.ngOnInit();
        expect(setUpDataSpy).toHaveBeenCalled();
    });

    it('should call setUpData when next', () => {
        const setUpDataSpy = spyOn<any>(component, 'setUpData');
        const lastIndex = component.index;
        component.next();
        expect(component.gameStats[lastIndex + 1]).toEqual(component.currentStat);
        expect(setUpDataSpy).toHaveBeenCalled();
    });

    it('should call setUpData when previous', () => {
        const setUpDataSpy = spyOn<any>(component, 'setUpData');
        const lastIndex = component.index;
        component.previous();
        expect(component.gameStats[lastIndex - 1]).toEqual(component.currentStat);
        expect(setUpDataSpy).toHaveBeenCalled();
    });

    it('should return true if End', () => {
        component.index = component.gameStats.length - 1;
        expect(component.isEnd()).toBeTruthy();
    });

    it('should return true if First', () => {
        component.index = 0;
        expect(component.isFirst()).toBeTruthy();
    });

    it('should return false if not End', () => {
        component.index = component.gameStats.length - 2;
        expect(component.isEnd()).toBeFalsy();
    });

    it('should return false if not First', () => {
        component.index = 1;
        expect(component.isFirst()).toBeFalsy();
    });
});
