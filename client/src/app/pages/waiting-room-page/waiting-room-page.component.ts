import { Component, Input, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    @Input() isHost: boolean = true; // temporary set to true for testing functionality
    roomCode: number; // temporary number for viewing

    constructor(public socketService: SocketClientService) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    ngOnInit() {
        this.connect();
        this.sendRoomCreation();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    private sendRoomCreation() {
        this.socketService.send('create Room', (room: number) => {
            this.roomCode = room;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            console.log(`Connexion par WebSocket sur le sockset ${this.socketId}`);
        });
    }
}
