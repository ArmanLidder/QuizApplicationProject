import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCreation } from '@app/components/game-creation/quiz-creation.component';

describe('GameCreation', () => {
    let component: GameCreation;
    let fixture: ComponentFixture<GameCreation>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreation],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreation);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
