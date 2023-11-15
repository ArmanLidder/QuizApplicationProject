import { Component, Input } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { playerStatus } from '@common/player-status/player-status';

type Player = [string, number, number, string];
type PlayerAbandonnement = [string, number, number, string];

const STATUS = 3;

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: PlayerAbandonnement[] = [];
    @Input() roomId: number;
    @Input() isFinal: boolean;
    players: Player[] = [];
    actualStatus: Player[] = [];

    constructor(public socketService: SocketClientService) {
        if (socketService.isSocketAlive()) this.configureBaseSocketFeatures();
    }

    getPlayersList(resetPlayerStatus: boolean = true) {
        console.log(`getPlayersList with isNextQuestion = ${resetPlayerStatus}`);
        this.socketService.send(socketEvent.gatherPlayersUsername, this.roomId, (players: string[]) => {
            this.setupPlayerList();
            players.forEach((username) => {
                this.getPlayerScoreFromServer(username, resetPlayerStatus);
            });
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
        this.players.sort(this.comparePlayers);
    }

    private appendLeftPlayersToActivePlayers() {
        this.leftPlayers.forEach(([username, points, bonusCount]) => this.players.push([username, points, bonusCount, playerStatus.left]));
    }
    private setupPlayerList() {
        this.actualStatus = this.players;
        this.players = [];
        this.appendLeftPlayersToActivePlayers();
    }

    private isPlayerGone(username: string) {
        const foundPlayer = this.leftPlayers.find((player) => player[0] === username);
        return foundPlayer !== undefined;
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

    private comparePlayers(firstPlayer: Player, secondPlayer: Player) {
        if (secondPlayer[1] - firstPlayer[1] !== 0) return secondPlayer[1] - firstPlayer[1];
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }
}
