import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    @Input() isHost: boolean;
    roomCode: number = 1234; //temporary number for viewing
}
