import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { GameItemComponent } from './game-item.component';
import { QuizService } from '@app/services/quiz.service';
import SpyObj = jasmine.SpyObj;

describe('GameItemComponent', () => {
    let quizServiceSpy: SpyObj<QuizService>;
    let component: GameItemComponent;
    let fixture: ComponentFixture<GameItemComponent>;

    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['basicDelete']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameItemComponent],
            imports: [HttpClientModule],
            providers: [{ provide: QuizService, useValue: quizServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameItemComponent);
        component = fixture.componentInstance;
        component.quiz = {
            id: '1',
            title: 'Filler',
            description: 'filler description',
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
        component.isAdmin = true;
        fixture.detectChanges();
    })

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clicking the delete button should call the quizService basicDelete method', () => {
        const button =  fixture.debugElement.nativeElement.querySelector('.delete-button');
        button.click();
        expect(quizServiceSpy.basicDelete).toHaveBeenCalled();
    });

    it('clicking the update button should call updateGame()', () => {
        // TODO: This test is temporary, need to make it better
        spyOn(component, 'updateGame');
        const button =  fixture.debugElement.nativeElement.querySelector('.update-button');
        button.click();
        expect(component.updateGame).toHaveBeenCalled();
    });

    it('should export the game when export button is pressed', () => {
        // TODO: This test is temporary, need to make it better
        spyOn(component, 'exportGame');
        const button =  fixture.debugElement.nativeElement.querySelector('.export-button');
        button.click();
        expect(component.exportGame).toHaveBeenCalled();
    });
    
});
