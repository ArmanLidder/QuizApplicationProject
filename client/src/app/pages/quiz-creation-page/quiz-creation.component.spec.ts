import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationComponent } from '@app/pages/quiz-creation-page/quiz-creation.component';

describe('QuizCreationComponent', () => {
    let component: QuizCreationComponent;
    let fixture: ComponentFixture<QuizCreationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuizCreationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
