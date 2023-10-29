import { Component } from '@angular/core';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';

@Component({
  selector: 'app-game-interface',
  templateUrl: './game-interface.component.html',
  styleUrls: ['./game-interface.component.scss']
})
export class GameInterfaceComponent {
    // ngOnInit to get first question, timer start only host
    // configSockets
    timer: number;
    duration: number = 30;
    question: QuizQuestion = {
            type: QuestionType.QCM,
            text: 'What is 2 + 2?',
            points: 50,
            choices: [
                { text: 'karim', isCorrect: false },
                { text: 'arman', isCorrect: true },
                { text: 'benzema', isCorrect: false },
            ],
    }

    protected readonly QuestionType = QuestionType;
}
