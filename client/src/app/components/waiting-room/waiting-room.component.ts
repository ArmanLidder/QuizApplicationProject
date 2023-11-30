import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DELETE_NUMBER, START_TRANSITION_DELAY } from '@app/components/waiting-room/waiting-room.component.const';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

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
    players: string[] = [];
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
        window.onbeforeunload = () => this.ngOnDestroy();
    }

    ngOnDestroy() {
        if (!this.isGameStarting) {
            const messageType = this.isHost ? socketEvent.HOST_LEFT : socketEvent.PLAYER_LEFT;
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
        this.socketService.send(socketEvent.STOP_TIMER, this.roomId);
    }

    private sendRoomCreation() {
        const QUIZ_ID = this.route.snapshot.paramMap.get('id');
        this.socketService.send(socketEvent.CREATE_ROOM, QUIZ_ID, (roomCode: number) => {
            this.roomId = roomCode;
        });
    }

    private sendBanPlayer(username: string) {
        this.socketService.send(socketEvent.BAN_PLAYER, { roomId: this.roomId, username });
    }

    private sendToggleRoomLock() {
        this.socketService.send(socketEvent.TOGGLE_ROOM_LOCK, this.roomId);
    }

    private sendStartSignal() {
        this.socketService.send(socketEvent.START, { roomId: this.roomId, time: START_TRANSITION_DELAY });
    }

    private removePlayer(username: string) {
        const index = this.players.indexOf(username);
        this.players.splice(index, DELETE_NUMBER);
    }

    private gatherPlayers() {
        this.socketService.send(socketEvent.GATHER_PLAYERS_USERNAME, this.roomId, (players: string[]) => {
            this.players = players;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.NEW_PLAYER, (players: string[]) => {
            this.players = players;
        });

        this.socketService.on(socketEvent.REMOVED_FROM_GAME, () => {
            this.router.navigate(['/home']);
        });

        this.socketService.on(socketEvent.REMOVED_PLAYER, (username: string) => {
            if (this.players.includes(username)) {
                this.removePlayer(username);
            }
        });

        this.socketService.on(socketEvent.TIME, (timeValue: number) => {
            this.isTransition = true;
            this.time = timeValue;
            if (this.time === 0) {
                this.router.navigate(['game', this.roomId]);
                this.isGameStarting = true;
            }
        });

        this.socketService.on(socketEvent.FINAL_TIME_TRANSITION, () => {
            if (this.isTransition) {
                this.router.navigate(['/']);
            }
        });
    }
}
