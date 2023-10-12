import { Component } from '@angular/core';

@Component({
    selector: 'app-waiting-room-player-page',
    templateUrl: './waiting-room-player-page.component.html',
    styleUrls: ['./waiting-room-player-page.component.scss'],
})
export class WaitingRoomPlayerPageComponent {
    roomId: number;
    username: string;
    isValidation: boolean = true;

    receiveRoomId(roomId: number) {
        this.roomId = roomId;
    }

    receiveUsername(username: string) {
        this.username = username;
    }

    receiveValidation(isValid: boolean) {
        this.isValidation = isValid;
    }
}
