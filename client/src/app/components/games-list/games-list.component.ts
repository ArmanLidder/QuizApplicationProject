import { Component } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';

@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent {

    quizzes: Quiz[] = [
        {
            id: "1",
            title: "Math Quiz",
            duration: 30,
            lastModification: "2023-09-15",
            questions: [
                {
                    type: 0,
                    text: "What is 2 + 2?",
                    points: 5,
                    choices: [
                        { text: "3" },
                        { text: "4", isCorrect: true },
                        { text: "5" },
                    ],
                },
                {
                    type: 1,
                    text: "Solve for x: 3x - 7 = 14",
                    points: 10,
                },
            ],
            visible: true,
        },
        {
            id: "2",
            title: "Science Quiz",
            duration: 45,
            lastModification: "2023-09-15",
            questions: [
                {
                    type: 0,
                    text: "What is the chemical symbol for water?",
                    points: 5,
                    choices: [
                        { text: "O2" },
                        { text: "H2O", isCorrect: true },
                        { text: "CO2" },
                    ],
                },
                {
                    type: 1,
                    text: "What is the boiling point of water in Celsius?",
                    points: 10,
                },
            ],
            visible: true,
        },
    ];
}
