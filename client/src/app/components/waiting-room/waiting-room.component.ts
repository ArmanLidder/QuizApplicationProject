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
    @Input() myName: string;
    @Input() isActive: boolean;
    isRoomLocked: boolean = false;
    lockActionMessage: string = this.setLockActionMessage();
    players: string[];

    constructor(
        public socketService: SocketClientService,
        private readonly route: ActivatedRoute,
        private router: Router,
    ) {
        this.connect();
    }

    ngOnInit() {
        if (this.isHost) this.sendRoomCreation();
        this.myName = !this.myName ? 'Organisateur' : this.myName;
        window.onbeforeunload = () => this.ngOnDestroy();
    }

    ngOnDestroy() {
        const messageType = this.isHost ? 'host abandonment' : 'player abandonment';
        this.socketService.send(messageType, this.roomId);
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
        this.configureBaseSocketFeatures();
    }

    banPlayer(username: string) {
        this.sendBanPlayer(username);
    }

    toggleRoomLocked() {
        this.isRoomLocked = !this.isRoomLocked;
        this.setLockActionMessage();
        this.sendToggleRoomLock();
    }

    setLockActionMessage() {
        return this.isRoomLocked ? 'vérouillée' : 'ouverte';
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

    private sendBanPlayer(username: string) {
        this.socketService.send('ban player', { roomId: this.roomId, username });
    }

    private sendToggleRoomLock() {
        this.socketService.send('toggle room lock', this.roomId);
    }

    private sendStartSignal() {
        this.socketService.send('start', this.roomId);
    }

    private removePlayer(username: string) {
        const index = this.players.indexOf(username);
        this.players.splice(index, DELETE_NUMBER);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('new player', (players: string[]) => {
            this.players = players;
        });

        this.socketService.on('removed from game', () => {
            this.router.navigate(['/home']);
        });

        this.socketService.on('removed player', (username: string) => {
            if (this.players.includes(username)) {
                this.removePlayer(username);
            }
        });
    }
}
