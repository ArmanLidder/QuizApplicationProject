import { Injectable } from '@angular/core';
import { playerStatus } from '@common/player-status/player-status';
import { ORDER_FIRST, ORDER_LAST, ORDER_SECOND, ORDER_THIRD, PlayerStatus, STATUS } from '@app/services/sort-list.service/sort-list.service.const';

@Injectable({
    providedIn: 'root',
})
export class SortListService {
    readonly mapStatus = new Map([
        [playerStatus.noInteraction, ORDER_FIRST],
        [playerStatus.interaction, ORDER_SECOND],
        [playerStatus.validation, ORDER_THIRD],
        [playerStatus.left, ORDER_LAST],
    ]);
    sortFunction: (arg1: PlayerStatus, arg2: PlayerStatus) => number = this.sortComparaisonByName;

    sortByName() {
        this.sortFunction = this.sortComparaisonByName.bind(this);
    }

    sortByScore() {
        this.sortFunction = this.sortComparaisonByScore.bind(this);
    }

    sortByStatus() {
        this.sortFunction = this.sortComparaisonByStatus.bind(this);
    }

    private sortComparaisonByName(firstPlayer: PlayerStatus, secondPlayer: PlayerStatus) {
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }

    private sortComparaisonByScore(firstPlayer: PlayerStatus, secondPlayer: PlayerStatus) {
        const scoreComparaison = secondPlayer[1] - firstPlayer[1];
        if (scoreComparaison !== 0) return scoreComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }

    private sortComparaisonByStatus(firstPlayer: PlayerStatus, secondPlayer: PlayerStatus) {
        const statusComparaison = (this.mapStatus.get(secondPlayer[STATUS]) ?? 0) - (this.mapStatus.get(firstPlayer[STATUS]) ?? 0);
        if (statusComparaison !== 0) return statusComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }
}
