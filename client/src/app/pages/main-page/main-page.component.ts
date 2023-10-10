import { Component } from '@angular/core';
@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'OnlyQuiz';
    isWantingToJoinGame: boolean;

    toggleChange(value: boolean){
        this.isWantingToJoinGame = value;
    }


}
