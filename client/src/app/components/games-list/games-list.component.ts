import { Component } from '@angular/core';

@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.scss']
})
export class GamesListComponent {
    games: string[] = ["jeux1", "jeux2", "jeux3"];
    public delete() :void {

    }
}
