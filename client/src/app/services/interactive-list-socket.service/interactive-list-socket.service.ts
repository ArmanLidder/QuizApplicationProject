import { Injectable } from '@angular/core';
import { CAN_TALK, Player, PLAYER_NOT_FOUND_INDEX, STATUS_INDEX } from '@app/components/player-list/player-list.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { playerStatus } from '@common/player-status/player-status';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

type UserData = { username: string; resetPlayerStatus: boolean };
type RoomSettings = { roomId: number; resetPlayerStatus: boolean };

@Injectable({
    providedIn: 'root',
})
export class InteractiveListSocketService {
    players: Player[] = [];
    isFinal: boolean = false;
    private actualStatus: Player[] = [];

    constructor(private socketService: SocketClientService) {}

    async getPlayersList(roomId: number, leftPlayers: Player[] = [], resetPlayerStatus: boolean = true) {
        return new Promise<number>((resolve) => {
            this.gatherPlayersUsername({ resetPlayerStatus, roomId }, resolve, leftPlayers);
        });
    }

    toggleChatPermission(username: string, roomId: number) {
        const playerIndex = this.findPlayer(username, this.players);
        this.players[playerIndex][CAN_TALK] = !this.players[playerIndex][CAN_TALK];
        this.socketService.send(socketEvent.TOGGLE_CHAT_PERMISSION, { roomId, username });
    }

    configureBaseSocketFeatures() {
        this.reset();
        this.handleUpdateInteraction();
        this.handleSubmitAnswer();
    }

    isPlayerGone(username: string, leftPlayers: Player[]) {
        const foundPlayer = leftPlayers.find((player) => player[0] === username);
        return foundPlayer !== undefined;
    }

    private gatherPlayersUsername(roomSettings: RoomSettings, resolve: (value: number | PromiseLike<number>) => void, leftPlayers: Player[]) {
        this.socketService.send(socketEvent.GATHER_PLAYERS_USERNAME, roomSettings.roomId, (players: string[]) => {
            resolve(players.length);
            this.setUpPlayerList(leftPlayers);
            players.forEach((username) => {
                this.getPlayerScoreFromServer({ username, resetPlayerStatus: roomSettings.resetPlayerStatus }, roomSettings.roomId, leftPlayers);
            });
        });
    }

    private setUpPlayerList(leftPlayers: Player[]) {
        this.actualStatus = this.players;
        this.players = [];
        this.appendLeftPlayersToActivePlayers(leftPlayers);
    }

    private getPlayerScoreFromServer(userInfo: UserData, roomId: number, leftPlayers: Player[]) {
        this.socketService.send(socketEvent.GET_SCORE, { roomId, username: userInfo.username }, (score: Score) => {
            this.addPlayer(userInfo, score, leftPlayers);
        });
    }

    private addPlayer(userInfo: UserData, score: Score, leftPlayers: Player[]) {
        const status = this.initPlayerStatus(userInfo.username, userInfo.resetPlayerStatus, leftPlayers);
        const canChat = this.canPlayerChat(userInfo.username);
        this.players.push([userInfo.username, score.points, score.bonusCount, status, canChat]);
    }

    private canPlayerChat(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus.length === 0 ? true : this.actualStatus[playerIndex][CAN_TALK];
    }

    private appendLeftPlayersToActivePlayers(leftPlayers: Player[]) {
        leftPlayers.forEach(([username, points, bonusCount]) => this.players.push([username, points, bonusCount, playerStatus.LEFT, false]));
    }

    private findPlayer(username: string, players: Player[]) {
        return players.findIndex((player) => player[0] === username);
    }

    private handleUpdateInteraction() {
        this.socketService.on(socketEvent.UPDATE_INTERACTION, (username: string) => {
            this.changePlayerStatus(username, playerStatus.INTERACTION);
        });
    }

    private handleSubmitAnswer() {
        this.socketService.on(socketEvent.SUBMIT_ANSWER, (username: string) => {
            this.changePlayerStatus(username, playerStatus.VALIDATION);
        });
    }

    private changePlayerStatus(username: string, status: string) {
        const playerIndex = this.findPlayer(username, this.players);
        if (playerIndex !== PLAYER_NOT_FOUND_INDEX) this.players[playerIndex][STATUS_INDEX] = status;
    }

    private initPlayerStatus(username: string, resetPlayerStatus: boolean, leftPlayers: Player[]) {
        if (this.isPlayerGone(username, leftPlayers)) return playerStatus.LEFT;
        else if (!resetPlayerStatus) return this.getActualStatus(username);
        else return this.isFinal ? playerStatus.END_GAME : playerStatus.NO_INTERACTION;
    }

    private getActualStatus(username: string) {
        const playerIndex = this.findPlayer(username, this.actualStatus);
        return this.actualStatus[playerIndex][STATUS_INDEX];
    }

    private reset() {
        this.isFinal = false;
        this.actualStatus = [];
        this.players = [];
    }
}
