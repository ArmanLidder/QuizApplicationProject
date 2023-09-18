import { Component, Input, OnInit } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit {
    @Input() isAdmin: boolean;
    quizzes: Quiz[];
    constructor(public quizServices: QuizService) {}

    ngOnInit() {
        this.populateGameList();
    }

    populateGameList() {
        if (this.isAdmin) this.getAllQuizzes();
        else this.getAllVisibleQuizzes();
    }

    getAllQuizzes() {
        this.quizServices.basicGetAll().subscribe((res) => {
            this.quizzes = res;
            // console.log(res);
        });
    }

    getAllVisibleQuizzes() {
        this.quizServices.basicGetAllVisible().subscribe((res) => {
            this.quizzes = res;
            // console.log(res);
        });
    }

    // Something wrong with tha method (quiz.visible has the right value but request quiz have the inverse)
    updateVisibility(quiz: Quiz) {
        console.log(quiz);
        const newQuiz = {
            id: quiz.id,
            duration: quiz.duration,
            lastModification: quiz.lastModification,
            questions: quiz.questions,
            title: quiz.title,
            visible: !quiz.visible,
        };
        this.quizServices.basicPut(newQuiz).subscribe(
            (res) => {
                console.log('HTTP Response', res);
            },
            (error) => {
                console.log('HTTP error', error);
            },
        );
    }
}
