import { Component, Input } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { playerStatus } from '@common/player-status/player-status';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';
import { STATUS_INDEX, CAN_TALK, Player, SORT_BY_STATUS, SORT_BY_SCORE, SORT_BY_NAME} from '@app/components/player-list/player-list.component.const';

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
    actualStatus: Player[] = [];
    order = 1;
    orderIcon = 'fa-solid fa-up-long';
    optionSelections = new Map([
        [SORT_BY_NAME, true],
        [SORT_BY_SCORE, false],
        [SORT_BY_STATUS, false],
    ]);

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

    getPlayersList(resetPlayerStatus: boolean = true) {
        this.socketService.send(socketEvent.gatherPlayersUsername, this.roomId, (players: string[]) => {
            this.setupPlayerList();
            players.forEach((username) => {
                this.getPlayerScoreFromServer(username, resetPlayerStatus);
            });
        });
    }

    toggleChatPermission(username: string) {
        const playerIndex = this.findPlayer(username, this.players);
        this.players[playerIndex][4] = !this.players[playerIndex][4];
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
        const canChat = this.canPlayerChat(username);
        this.players.push([username, score.points, score.bonusCount, status, canChat]);
        this.players.sort((first: Player, second: Player) => this.order * this.sortListService.sortFunction(first, second));
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
