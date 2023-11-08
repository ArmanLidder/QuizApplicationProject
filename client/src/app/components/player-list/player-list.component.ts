import { Component, Input } from '@angular/core';
import { Player } from '@app/services/game-real.service/game-real.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: Player[];
    @Input() roomId: number;
    players: Player[] = [];

    constructor(public socketService: SocketClientService) {}

    getPlayersList() {
        this.socketService.send(socketEvent.gatherPlayersUsername, this.roomId, (players: string[]) => {
            this.players = [];
            players.forEach((username) => {
                this.getPlayerScoreFromServer(username);
            });
        });
    }

    private getPlayerScoreFromServer(username: string) {
        this.socketService.send(socketEvent.getScore, { roomId: this.roomId, username }, (score: Score) => {
            this.sortPlayersByScore(username, score);
        });
    }

    private sortPlayersByScore(username: string, score: Score) {
        this.players.push([username, score.points, score.bonusCount]);
        this.players.sort(this.comparePlayers);
    }

    private comparePlayers(firstPlayer: Player, secondPlayer: Player) {
        if (secondPlayer[1] - firstPlayer[1] !== 0) return secondPlayer[1] - firstPlayer[1];
        return firstPlayer[0].localeCompare(secondPlayer[0]);
    }
}
