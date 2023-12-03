import { Component, OnInit } from '@angular/core';
import { GameHistoryService } from '@app/services/game-history.service/game-history.service';
import { GameInfo } from '@common/interfaces/game-info.interface';
import { DEFAULT_RADIX_VALUE } from '@common/constants/game-history-list.component.const';
@Component({
    selector: 'app-history-list',
    templateUrl: './game-history-list.component.html',
    styleUrls: ['./game-history-list.component.scss'],
})
export class GameHistoryListComponent implements OnInit {
    games: GameInfo[] = [];
    isNameAscendingOrder = false;
    isDateAscendingOrder = false;
    isNameIconClicked = false;
    isDateIconClicked = false;
    constructor(public gameHistoryServices: GameHistoryService) {}

    ngOnInit(): void {
        this.getAllGames();
    }

    getAllGames() {
        this.gameHistoryServices.getAll().subscribe((res) => {
            this.games = res;
            this.sortGameName();
        });
    }

    deleteAllGames() {
        this.gameHistoryServices.deleteAll().subscribe();
        this.games = [];
    }

    sortGameName() {
        this.isNameAscendingOrder = !this.isNameAscendingOrder;
        this.isNameIconClicked = true;
        this.isDateIconClicked = false;
        this.games.sort((a, b) => {
            const nameA = a.gameName.toLowerCase();
            const nameB = b.gameName.toLowerCase();
            return this.isNameAscendingOrder ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
    }

    sortDate() {
        this.isDateAscendingOrder = !this.isDateAscendingOrder;
        this.isDateIconClicked = true;
        this.isNameIconClicked = false;
        this.games.sort((a, b) => {
            const dateA = this.convertDateToNumber(a.startTime);
            const dateB = this.convertDateToNumber(b.startTime);
            return this.isDateAscendingOrder ? dateA - dateB : dateB - dateA;
        });
    }

    getSortIcon(column: string) {
        if (column === 'name') return this.isNameAscendingOrder ? '▲' : '▼';
        else return this.isDateAscendingOrder ? '▲' : '▼';
    }

    private convertDateToNumber(dateString: string) {
        const cleanedString = dateString.replace(/[-: ]/g, '');
        return parseInt(cleanedString, DEFAULT_RADIX_VALUE);
    }
}
