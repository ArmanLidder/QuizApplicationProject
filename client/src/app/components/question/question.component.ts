import { Component } from '@angular/core';
import { QuizCreationService } from '@app/services/quiz-creation.service';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    constructor(public quizCreationService: QuizCreationService) {}
}
