import { Component, Input } from '@angular/core';
import { Message } from '@common/interfaces/message.interface';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    @Input() roomId: number;
    @Input() myName: string;
    messages: Message[];

    constructor(public socketService: SocketClientService) {
        if (this.roomId) {
            this.getRoomMessages();
            this.configureBaseSocketFeatures();
        }
    }

    sendMessage(message: Message) {
        this.socketService.send('new message', { roomId: Number(this.roomId), message });
    }

    private getRoomMessages() {
        this.socketService.send('player join', { roomId: Number(this.roomId) }, (messages: Message[]) => {
            this.messages = messages;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('message received', (message: Message) => {
            this.messages.push(message);
        });
    }
}
