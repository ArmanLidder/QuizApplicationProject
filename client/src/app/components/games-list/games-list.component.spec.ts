import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { GamesListComponent } from './games-list.component';
import { QuizService } from '@app/services/quiz.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { QuestionType, Quiz } from '@app/interfaces/quiz.interface';

describe('GamesListComponent', () => {
    let quizServiceSpy: SpyObj<QuizService>;
    let component: GamesListComponent;
    let fixture: ComponentFixture<GamesListComponent>;

    beforeEach(() => {
        quizServiceSpy = jasmine.createSpyObj('QuizService', ['basicGetAll', 'basicGetAllVisible', 'basicPatch']);
        quizServiceSpy.basicGetAll.and.returnValue(of([]));
        quizServiceSpy.basicGetAllVisible.and.returnValue(of([]));
        quizServiceSpy.basicPatch.and.returnValue(of());
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GamesListComponent],
            imports: [HttpClientModule],
            providers: [{ provide: QuizService, useValue: quizServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GamesListComponent);
        component = fixture.componentInstance;
        component.isAdmin = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate game list for admin', () => {
        component.isAdmin = true;

        component.populateGameList();

        expect(quizServiceSpy.basicGetAll).toHaveBeenCalled();
    });

    it('should populate game list for non-admin', () => {
        component.isAdmin = false;

        component.populateGameList();

        expect(quizServiceSpy.basicGetAllVisible).toHaveBeenCalled();
    });

    it('should update visibility', () => {
        const testQuiz: Quiz = {
            id: '1',
            title: 'Filler',
            description: 'filler description',
            duration: 30,
            lastModification: '2023-09-15',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'What is 2 + 2?',
                    points: 5,
                    choices: [
                        { text: '3', isCorrect: false },
                        { text: '4', isCorrect: true },
                        { text: '5', isCorrect: false },
                    ],
                },
            ],
            visible: true,
        };

        component.isAdmin = true;

        component.updateVisibility(testQuiz);

        expect(quizServiceSpy.basicPatch).toHaveBeenCalledWith(testQuiz.id, false);
    });
});
