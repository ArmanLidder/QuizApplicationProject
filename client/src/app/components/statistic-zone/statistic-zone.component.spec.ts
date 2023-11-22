import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticZoneComponent } from './statistic-zone.component';

describe('StatisticZoneComponent', () => {
    let component: StatisticZoneComponent;
    let fixture: ComponentFixture<StatisticZoneComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StatisticZoneComponent],
        });
        fixture = TestBed.createComponent(StatisticZoneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
