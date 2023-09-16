import { Component, Input } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';
// import * as fs from 'fs';

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @Input() quiz: Quiz;
    updateVisibility(): void {
        // TODO implement it with server
    }
    deleteGame() {
        //  TODO implement it with server
        return;
    }

    updateGame() {
        //  TODO implement it with server
        return;
    }

    exportGame() : void {
        // TODO implement it with server
        // const { visible, ...exportableQuiz } = this.quiz;
        // const jsonQuiz = JSON.stringify(exportableQuiz);
        // fs.writeFileSync(this.quiz.title, jsonQuiz, 'utf-8');
        // return;
    }
}
