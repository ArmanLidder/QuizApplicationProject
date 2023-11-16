import { Component, Input } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { playerStatus } from '@common/player-status/player-status';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';

export type Player = [string, number, number, string];
type PlayerAbandonment = [string, number, number, string];

const STATUS = 3;

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: PlayerAbandonment[] = [];
    @Input() roomId: number;
    @Input() isFinal: boolean;
    players: Player[] = [];
    actualStatus: Player[] = [];
    order = 1;
    orderIcon = 'fa-solid fa-up-long';
    optionSelections = new Map([
        ['byName', true],
        ['byScore', false],
        ['byStatus', false],
    ]);
    private sortFunction: (arg1: Player, arg2: Player) => number;

    constructor(
        public socketService: SocketClientService,
        public sortListService: SortListService,
    ) {
        if (socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.sortFunction = this.sortListService.sortWithName;
    }
    changeOrder() {
        this.order *= -1;
        this.orderIcon = this.order > 0 ? 'fa-solid fa-up-long' : 'fa-solid fa-down-long';
        this.getPlayersList(false);
    }
    sortByStatus() {
        this.updateOptionSelections('byStatus');
        this.sortFunction = this.sortListService.sortWithStatus.bind(this.sortListService);
        this.getPlayersList(false);
    }

    sortByScore() {
        this.updateOptionSelections('byScore');
        this.sortFunction = this.sortListService.sortWithScore.bind(this.sortListService);
        this.getPlayersList(false);
    }

    sortByName() {
        this.updateOptionSelections('byName');
        this.sortFunction = this.sortListService.sortWithName;
        this.getPlayersList(false);
    }

    getPlayersList(resetPlayerStatus: boolean = true) {
        this.socketService.send(socketEvent.gatherPlayersUsername, this.roomId, (players: string[]) => {
            this.setupPlayerList();
            players.forEach((username) => {
                this.getPlayerScoreFromServer(username, resetPlayerStatus);
            });
        });
    }

    toggleChatPermission(username: string) {
        this.socketService.send(socketEvent.toggleChatPermission, { roomId: this.roomId, username });
    }
    isPlayerGone(username: string) {
        const foundPlayer = this.leftPlayers.find((player) => player[0] === username);
        return foundPlayer !== undefined;
    }
    private updateOptionSelections(selectedMethod: string) {
        this.optionSelections.forEach((isSelected, methodName) => {
            if (isSelected && methodName !== selectedMethod) this.optionSelections.set(methodName, false);
            else if (selectedMethod === methodName) this.optionSelections.set(methodName, true);
        });
    }

    private getPlayerScoreFromServer(username: string, resetPlayerStatus: boolean) {
        this.socketService.send(socketEvent.getScore, { roomId: this.roomId, username }, (score: Score) => {
            this.sortPlayersByScore(username, score, resetPlayerStatus);
        });
    }

    private sortPlayersByScore(username: string, score: Score, resetPlayerStatus: boolean) {
        const status = this.initPlayerStatus(username, resetPlayerStatus);
        this.players.push([username, score.points, score.bonusCount, status]);
        this.players.sort((first: Player, second: Player) => this.order * this.sortFunction(first, second));
    }

    private appendLeftPlayersToActivePlayers() {
        this.leftPlayers.forEach(([username, points, bonusCount]) => this.players.push([username, points, bonusCount, playerStatus.left]));
    }
    private setupPlayerList() {
        this.actualStatus = this.players;
        this.players = [];
        this.appendLeftPlayersToActivePlayers();
    }


    private findPlayer(username: string, players: Player[]) {
        return players.findIndex((player) => player[0] === username);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.updateSelection, (username: string) => {
            this.changePlayerStatus(username, playerStatus.interaction);
        });
        this.socketService.on(socketEvent.submitAnswer, (username: string) => {
            this.changePlayerStatus(username, playerStatus.validation);
        });
    }

    private changePlayerStatus(username: string, status: string) {
        const playerIndex = this.findPlayer(username, this.players);
        const notFound = -1;
        const statusIndex = 3;
        if (playerIndex !== notFound) this.players[playerIndex][statusIndex] = status;
    }

    private initPlayerStatus(username: string, resetPlayerStatus: boolean) {
        if (this.isPlayerGone(username)) return playerStatus.left;
        else if (!resetPlayerStatus) return this.getActualStatus(username);
        else return this.isFinal ? playerStatus.endGame : playerStatus.noInteraction;
    }
    private getActualStatus(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus[playerIndex][STATUS];
    }
}
