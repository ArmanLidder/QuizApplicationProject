import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizCreationComponent } from '@app/components/quiz-creation/quiz-creation.component';
import { FormsModule } from '@angular/forms';

describe('QuizCreation', () => {
    let component: QuizCreationComponent;
    let fixture: ComponentFixture<QuizCreationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule],
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
