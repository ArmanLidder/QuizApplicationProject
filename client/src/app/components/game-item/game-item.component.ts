import { Component, Input } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz';

// const visiblityText: { [key: string]: string } = {
//     'v': "visible",
//     'n': "non-visible",
// }

@Component({
    selector: 'app-game-item',
    templateUrl: './game-item.component.html',
    styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent {
    @Input() quiz: Quiz;
    // visibility : string = this.quiz.visible ? visiblityText['v'] : visiblityText['n'];
    // updateVisibility() : void {
    //     this.visibility = !this.quiz.visible ? visiblityText['v'] : visiblityText['n']
    //     this.quiz.visible = !this.quiz.visible;
    // }
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
