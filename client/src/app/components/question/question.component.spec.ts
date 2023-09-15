import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionButton } from '@app/components/question/question.component';

describe('QuestionButton', () => {
    let component: QuestionButton;
    let fixture: ComponentFixture<QuestionButton>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionButton],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionButton);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
