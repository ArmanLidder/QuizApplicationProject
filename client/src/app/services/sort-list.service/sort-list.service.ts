import { Injectable } from '@angular/core';
import { playerStatus } from '@common/player-status/player-status';

export type Player = [string, number, number, string];
const STATUS = 3;
@Injectable({
    providedIn: 'root',
})
export class SortListService {
    readonly mapStatus = new Map([
        [playerStatus.noInteraction, 0],
        [playerStatus.interaction, 1],
        [playerStatus.validation, 2],
        [playerStatus.endGame, 3],
        [playerStatus.left, 4],
    ]);
    sortWithName(firstPlayer: Player, secondPlayer: Player) {
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }

    sortWithScore(firstPlayer: Player, secondPlayer: Player) {
        const scoreComparaison = secondPlayer[1] - firstPlayer[1];
        if (scoreComparaison !== 0) return scoreComparaison;
        return this.sortWithName(firstPlayer, secondPlayer);
    }

    // @ts-ignore
    sortWithStatus(firstPlayer: Player, secondPlayer: Player) {
        if (firstPlayer[STATUS].localeCompare(secondPlayer[STATUS]) === 0) return this.sortWithScore(firstPlayer, secondPlayer);
        // @ts-ignore
        return this.mapStatus.get(secondPlayer[STATUS]) - this.mapStatus.get(firstPlayer[STATUS]);
    }
}
