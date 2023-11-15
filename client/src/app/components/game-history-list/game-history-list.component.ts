import { Component, OnInit } from '@angular/core';
import {GameHistoryService} from '@app/services/game-history.service/game-history.service'
import { GameInfo } from '@common/interfaces/game-info.interface';
@Component({
    selector: 'app-history-list',
    templateUrl: './game-history-list.component.html',
    styleUrls: ['./game-history-list.component.scss'],
})

export class GameHistoryListComponent implements OnInit {
    games: GameInfo[] = [];

    constructor(
        public gameHistoryServices: GameHistoryService,

    ) {}

    ngOnInit(): void {
        this.getAllGames();
    }

    getAllGames() {
        this.gameHistoryServices.getAll().subscribe((res) => {
            this.games = res;
        });
    }

    deleteAllGames(){
        this.gameHistoryServices.deleteAll().subscribe();
        this.games = [];
    }
    
}
