import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DELETE_NUMBER, START_TRANSITION_DELAY } from '@app/components/waiting-room/waiting-room.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    @Input() isHost: boolean;
    @Input() roomId: number;
    @Input() isActive: boolean;
    @Input() isResult: boolean;
    isRoomLocked: boolean = false;
    isGameStarting: boolean = false;
    isTransition: boolean = false;
    players: string[];
    time: number;

    constructor(
        public socketService: SocketClientService,
        private readonly route: ActivatedRoute,
        private router: Router,
    ) {
        this.connect();
    }

    ngOnInit() {
        if (this.isHost) this.sendRoomCreation();
        if (!this.isHost) this.gatherPlayers();
    }

    ngOnDestroy() {
        if (!this.isGameStarting) {
            const messageType = this.isHost ? 'host abandonment' : 'player abandonment';
            this.socketService.send(messageType, this.roomId);
        }
        this.socketService.socket.removeAllListeners();
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
        this.sendToggleRoomLock();
    }

    setLockActionMessage() {
        return this.isRoomLocked ? 'verrouillée' : 'ouverte';
    }

    startGame() {
        this.sendStartSignal();
    }

    stopTimer() {
        this.socketService.send('stop timer', this.roomId);
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
        this.socketService.send('start', { roomId: this.roomId, time: START_TRANSITION_DELAY });
    }

    private removePlayer(username: string) {
        const index = this.players.indexOf(username);
        this.players.splice(index, DELETE_NUMBER);
    }

    private gatherPlayers() {
        this.socketService.send('gather players username', this.roomId, (players: string[]) => {
            this.players = players;
        });
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

        this.socketService.on('time', (timeValue: number) => {
            this.isTransition = true;
            this.time = timeValue;
            if (this.time === 0) {
                this.router.navigate(['game', this.roomId]);
                this.isGameStarting = true;
            }
        });

        this.socketService.on('final time transition', () => {
            if (this.isTransition) {
                this.router.navigate(['/']);
            }
        });
    }
}
