import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCodePromptComponent } from './room-code-prompt.component';

describe('RoomCodePromptComponent', () => {
    let component: RoomCodePromptComponent;
    let fixture: ComponentFixture<RoomCodePromptComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RoomCodePromptComponent],
        });
        fixture = TestBed.createComponent(RoomCodePromptComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
