import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomPlayerPageComponent } from './waiting-room-player-page.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WaitingRoomPlayerPageComponent', () => {
    let component: WaitingRoomPlayerPageComponent;
    let fixture: ComponentFixture<WaitingRoomPlayerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomPlayerPageComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(WaitingRoomPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
