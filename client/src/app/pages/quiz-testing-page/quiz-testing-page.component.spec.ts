import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTestingPageComponent } from './quiz-testing-page.component';

describe('QuizTestingPageComponent', () => {
    let component: QuizTestingPageComponent;
    let fixture: ComponentFixture<QuizTestingPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizTestingPageComponent],
        });
        fixture = TestBed.createComponent(QuizTestingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
