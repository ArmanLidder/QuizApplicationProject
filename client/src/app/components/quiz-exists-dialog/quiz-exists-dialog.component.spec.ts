import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizExistsDialogComponent } from '@app/components/quiz-exists-dialog/quiz-exists-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('QuizExistsDialogComponent', () => {
    let component: QuizExistsDialogComponent;
    let fixture: ComponentFixture<QuizExistsDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizExistsDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { title: 'Test Title', content: 'Test Content' } },
                { provide: MatDialogRef, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(QuizExistsDialogComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
