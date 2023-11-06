import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-quiz-exists-dialog',
    templateUrl: 'quiz-exists-dialog.component.html',
})
export class QuizExistsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }) {}
}
