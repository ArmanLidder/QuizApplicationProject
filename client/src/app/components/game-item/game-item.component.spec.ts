import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { GameItemComponent } from './game-item.component';

describe('GameItemComponent', () => {
    let component: GameItemComponent;
    let fixture: ComponentFixture<GameItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameItemComponent],
            imports: [HttpClientModule],
        });
        fixture = TestBed.createComponent(GameItemComponent);
        component = fixture.componentInstance;
        component.quiz = {
            id: '1',
            title: 'Filler',
            description : 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: 0,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                },
            ],
            visible: true,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
