import { Component, Input, OnInit } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { Quiz } from '@app/interfaces/quiz.interface';

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
        });
    }

    getAllVisibleQuizzes() {
        this.quizServices.basicGetAllVisible().subscribe((res) => {
            this.quizzes = res;
        });
    }

    updateVisibility(quiz: Quiz) {
        quiz.visible = !quiz.visible;
        this.quizServices.basicPatch(quiz.id, quiz.visible).subscribe();
    }
}
