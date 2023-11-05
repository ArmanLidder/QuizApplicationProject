import { Component, Input } from '@angular/core';
import { Player } from '@app/services/game-real.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Score } from '@common/interfaces/score.interface';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() roomId: number;
    players: Player[];

    constructor(public socketService: SocketClientService) {
        this.getPlayersList();
    }
    // ngOnInit() {
    //     this.getPlayersList();
    // }

    getPlayersList() {
        this.socketService.send('gather players username', this.roomId, (players: string[]) => {
            this.players = [];
            players.forEach((username) => {
                this.getPlayerScoreFromServer(username);
            });
        });
    }

    private getPlayerScoreFromServer(username: string) {
        this.socketService.send('get score', { roomId: this.roomId, username }, (score: Score) => {
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
