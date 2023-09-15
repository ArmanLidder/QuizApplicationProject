import { Component, Input } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz'; 

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})

export class GameItemComponent {
    @Input() quiz: Quiz;

    deleteGame() {
        return;
    }

    updateGame() {
        return;
    }

    exportGame() {
        return;
    }
}
