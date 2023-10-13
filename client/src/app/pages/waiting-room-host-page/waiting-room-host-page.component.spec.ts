import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaitingRoomHostPageComponent } from './waiting-room-host-page.component';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (id?: string) => '1' } } } }
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
