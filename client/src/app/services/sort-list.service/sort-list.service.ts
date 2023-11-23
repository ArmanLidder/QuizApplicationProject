import { Injectable } from '@angular/core';
import { playerStatus } from '@common/player-status/player-status';

export type Player = [string, number, number, string, boolean];
const STATUS = 3;
@Injectable({
    providedIn: 'root',
})
export class SortListService {
    readonly mapStatus = new Map([
        [playerStatus.noInteraction, 3],
        [playerStatus.interaction, 2],
        [playerStatus.validation, 1],
        [playerStatus.left, 0],
    ]);
    sortFunction: (arg1: Player, arg2: Player) => number = this.sortComparaisonByName;

    sortByName() {
        this.sortFunction = this.sortComparaisonByName;
    }

    sortByScore() {
        this.sortFunction = this.sortComparaisonByScore.bind(this);
    }

    sortByStatus() {
        this.sortFunction = this.sortComparaisonByStatus.bind(this);
    }

    private sortComparaisonByName(firstPlayer: Player, secondPlayer: Player) {
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }

    private sortComparaisonByScore(firstPlayer: Player, secondPlayer: Player) {
        const scoreComparaison = secondPlayer[1] - firstPlayer[1];
        if (scoreComparaison !== 0) return scoreComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }

    private sortComparaisonByStatus(firstPlayer: Player, secondPlayer: Player) {
        const statusComparaison = (this.mapStatus.get(secondPlayer[STATUS]) ?? 0) - (this.mapStatus.get(firstPlayer[STATUS]) ?? 0);
        if (statusComparaison !== 0) return statusComparaison;
        return this.sortComparaisonByName(firstPlayer, secondPlayer);
    }
}
