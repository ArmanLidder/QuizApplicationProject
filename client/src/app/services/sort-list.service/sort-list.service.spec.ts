import { TestBed } from '@angular/core/testing';

import { SortListService, Player } from './sort-list.service';
import { playerStatus } from '@common/player-status/player-status';
const SCORE_HIGH = 20;
const SCORE_LOW = 10;
const SCORE_MIDDLE = 15;

fdescribe('SortListService', () => {
    let service: SortListService;
    let mockPlayers: Player[];
    let name: string;
    let score: number;
    let status: string;
    const findByName = (player: Player) => player[0] === name;
    const findByScore = (player: Player) => player[1] === score;
    const findByStatus = (player: Player) => player[3] === status;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SortListService);
        mockPlayers = [
            ['Bob', SCORE_HIGH, 2, playerStatus.interaction],
            ['Karim', SCORE_MIDDLE, 1, playerStatus.validation],
            ['Alice', SCORE_LOW, 1, playerStatus.noInteraction],
            ['Mahmoud', SCORE_MIDDLE, 0, playerStatus.validation],
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should sort players alphabetically by name', () => {
        mockPlayers.sort(service.sortWithName);
        name = 'Alice';
        expect(mockPlayers.findIndex(findByName)).toEqual(0);
        name = 'Bob';
        expect(mockPlayers.findIndex(findByName)).toEqual(1);
        name = 'Karim';
        expect(mockPlayers.findIndex(findByName)).toEqual(2);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(3);
    });

    it('should sort players by score', () => {
        mockPlayers.sort(service.sortWithScore.bind(service));
        score = SCORE_HIGH;
        expect(mockPlayers.findIndex(findByScore)).toEqual(0);
        score = SCORE_MIDDLE;
        expect(mockPlayers.findIndex(findByScore)).toEqual(1);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(2);
        score = SCORE_LOW;
        expect(mockPlayers.findIndex(findByScore)).toEqual(3);
    });

    it('should sort players by status', () => {
        mockPlayers.sort(service.sortWithStatus.bind(service));
        status = playerStatus.validation;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(0);
        name = 'Mahmoud';
        expect(mockPlayers.findIndex(findByName)).toEqual(1);
        status = playerStatus.interaction;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(2);
        status = playerStatus.noInteraction;
        expect(mockPlayers.findIndex(findByStatus)).toEqual(3);
    });
});
