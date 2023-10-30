import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAnswersListComponent } from './game-answers-list.component';

describe('GameAnswersListComponent', () => {
    let component: GameAnswersListComponent;
    let fixture: ComponentFixture<GameAnswersListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameAnswersListComponent],
        });
        fixture = TestBed.createComponent(GameAnswersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
