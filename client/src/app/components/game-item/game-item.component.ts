import { Component, Input } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @Input() quiz: Quiz;
    @Input() isAdmin: boolean;
    constructor(private quizService: QuizService) {}

    deleteGame() {
        this.quizService.basicDelete(this.quiz.id);
    }

    updateGame() {
        return;
    }

    exportGame(): void {
        // const { ...exportableQuiz } = this.quiz;
        const jsonQuizData = JSON.stringify(this.quiz);
        const blob = new Blob([jsonQuizData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.quiz.title + '.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
