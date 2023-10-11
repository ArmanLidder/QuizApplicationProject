import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { ActivatedRoute, Router } from '@angular/router';

const DELETE_NUMBER = 1;
@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    @Input() isHost: boolean;
    @Input() roomId: number;
    @Input() isActive: boolean;
    players: string[];

    constructor(
        public socketService: SocketClientService,
        private readonly route: ActivatedRoute,
        private router: Router,
    ) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    ngOnInit() {
        this.connect();
        if (this.isHost) this.sendRoomCreation();
        if (this.isActive) this.gatherRoomData();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    banPlayer(username: string) {
        this.sendBanPlayer(username);
    }

    toggleRoomLocked() {
        this.sendToggleRoomLock();
    }

    startGame() {
        this.sendStartSignal();
    }

    private sendRoomCreation() {
        const QUIZ_ID = this.route.snapshot.paramMap.get('id');
        this.socketService.send('create Room', QUIZ_ID, (roomCode: number) => {
            this.roomId = roomCode;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            // console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
        });

        this.socketService.on('new player', (players: string[]) => {
            this.players = players;
        });

        this.socketService.on('removed from game', () => {
            this.router.navigate(['/home']);
        });

        this.socketService.on('banned player', (username: string) => {
            this.removePlayer(username);
        });
    }

    private sendBanPlayer(username: string) {
        this.socketService.send('ban player', { roomId: this.roomId, username });
    }

    private sendToggleRoomLock() {
        this.socketService.send('toggle room lock', this.roomId);
    }

    private sendStartSignal() {
        this.socketService.send('start', this.roomId);
    }

    // private addPlayer(username: string) {
    //     this.players.push(username);
    // }

    private gatherRoomData() {
        this.socketService.send('gather room data', this.roomId, (players: string[]) => {
            this.players = players
        })
    }

    private removePlayer(username: string) {
        const index = this.players.indexOf(username);
        this.players.splice(index, DELETE_NUMBER);
    }

    ngOnDestroy() {
        const messageType = this.isHost ? 'host abandonment' : 'player abandonment';
        this.socketService.send(messageType, this.roomId);
    }

}
