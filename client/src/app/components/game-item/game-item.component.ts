import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @ViewChild('downloadLink', { static: false }) downloadLink!: ElementRef;
    @Input() quiz: Quiz;
    @Input() isAdmin: boolean;
    @Output() removeQuiz: EventEmitter<string> = new EventEmitter<string>();
    constructor(
        private quizService: QuizService,
        private router: Router,
    ) {}

    deleteGame() {
        this.quizService.basicDelete(this.quiz.id).subscribe();
        this.removeQuiz.emit(this.quiz.id);
    }

    updateGame() {
        this.router.navigate(['quiz-creation', `${this.quiz.id}`]);
    }

    exportGame(): void {
        const { ...exportedQuiz } = this.quiz;
        delete exportedQuiz.visible;
        const jsonQuizData = JSON.stringify(exportedQuiz);
        const blob = new Blob([jsonQuizData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = this.downloadLink.nativeElement;
        a.href = url;
        a.download = this.quiz.title + '.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
