import { ComponentFixture, TestBed } from '@angular/core/testing';
import {QuizCreationPageComponent} from "@app/pages/quiz-creation-page/quiz-creation-page.component";

describe('QuizCreationComponent', () => {
    let component: QuizCreationPageComponent;
    let fixture: ComponentFixture<QuizCreationPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuizCreationPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuizCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
