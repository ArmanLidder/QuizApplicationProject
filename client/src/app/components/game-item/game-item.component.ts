import { Component, Input } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @Input() quiz: Quiz;
    updateVisibility() : void {
        //TODO implement it with server
    }
    deleteGame() {
        //  TODO implement it with server
        return;
    }

    updateGame() {
        //  TODO implement it with server
        return;
    }

    exportGame() {
        // TODO implement it with server
        return;
    }
}
