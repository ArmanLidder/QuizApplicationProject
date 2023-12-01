import { Component, Input } from '@angular/core';
import { CAN_TALK, Player, SORT_BY_NAME, SORT_BY_SCORE, SORT_BY_STATUS, STATUS_INDEX } from '@app/components/player-list/player-list.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';
import { Score } from '@common/interfaces/score.interface';
import { playerStatus } from '@common/player-status/player-status';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: Player[] = [];
    @Input() roomId: number;
    @Input() isFinal: boolean;
    @Input() isHost: boolean;
    players: Player[] = [];
    orderIcon = 'fa-solid fa-up-long';
    optionSelections = new Map([
        [SORT_BY_NAME, true],
        [SORT_BY_SCORE, false],
        [SORT_BY_STATUS, false],
    ]);
    private actualStatus: Player[] = []; // meilleur nom?
    private order = 1;

    constructor(
        public socketService: SocketClientService,
        public sortListService: SortListService,
    ) {
        if (socketService.isSocketAlive()) this.configureBaseSocketFeatures();
    }

    changeOrder() {
        this.order *= -1;
        this.orderIcon = this.order > 0 ? 'fa-solid fa-up-long' : 'fa-solid fa-down-long';
        this.getPlayersList(false);
    }

    sortByStatus() {
        this.updateOptionSelections(SORT_BY_STATUS);
        this.sortListService.sortByStatus();
        this.getPlayersList(false);
    }

    sortByScore() {
        this.updateOptionSelections(SORT_BY_SCORE);
        this.sortListService.sortByScore();
        this.getPlayersList(false);
    }

    sortByName() {
        this.updateOptionSelections(SORT_BY_NAME);
        this.sortListService.sortByName();
        this.getPlayersList(false);
    }

    sortAllPlayers(): Player[] {
        this.players.sort((first: Player, second: Player) => this.order * this.sortListService.sortFunction(first, second));
        return this.players;
    }

    async getPlayersList(resetPlayerStatus: boolean = true) {
        return new Promise<number>((resolve) => {
            this.socketService.send(socketEvent.GATHER_PLAYERS_USERNAME, this.roomId, (players: string[]) => {
                resolve(players.length);
                this.setupPlayerList();
                players.forEach((username) => {
                    this.getPlayerScoreFromServer(username, resetPlayerStatus);
                });
            });
        });
    }

    toggleChatPermission(username: string) {
        const playerIndex = this.findPlayer(username, this.players);
        this.players[playerIndex][4] = !this.players[playerIndex][4];
        this.socketService.send(socketEvent.TOGGLE_CHAT_PERMISSION, { roomId: this.roomId, username });
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
        this.socketService.send(socketEvent.GET_SCORE, { roomId: this.roomId, username }, (score: Score) => {
            this.addPlayer(username, score, resetPlayerStatus);
        });
    }

    private addPlayer(username: string, score: Score, resetPlayerStatus: boolean) {
        const status = this.initPlayerStatus(username, resetPlayerStatus);
        const canChat = this.canPlayerChat(username);
        this.players.push([username, score.points, score.bonusCount, status, canChat]);
    }

    private canPlayerChat(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus.length === 0 ? true : this.actualStatus[playerIndex][CAN_TALK];
    }

    private appendLeftPlayersToActivePlayers() {
        this.leftPlayers.forEach(([username, points, bonusCount]) => this.players.push([username, points, bonusCount, playerStatus.left, false]));
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
        this.socketService.on(socketEvent.UPDATE_INTERACTION, (username: string) => {
            this.changePlayerStatus(username, playerStatus.interaction);
        });
        this.socketService.on(socketEvent.SUBMIT_ANSWER, (username: string) => {
            this.changePlayerStatus(username, playerStatus.validation);
        });
    }

    private changePlayerStatus(username: string, status: string) {
        const playerIndex = this.findPlayer(username, this.players);
        const notFound = -1;
        if (playerIndex !== notFound) this.players[playerIndex][STATUS_INDEX] = status;
    }

    private initPlayerStatus(username: string, resetPlayerStatus: boolean) {
        if (this.isPlayerGone(username)) return playerStatus.left;
        else if (!resetPlayerStatus) return this.getActualStatus(username);
        else return this.isFinal ? playerStatus.endGame : playerStatus.noInteraction;
    }

    private getActualStatus(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus[playerIndex][STATUS_INDEX];
    }
}
