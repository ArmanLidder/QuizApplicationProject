import { Component, Input } from '@angular/core';
import { Message } from '@common/interfaces/message.interface';
import { SocketClientService } from '@app/services/socket-client.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getCurrentDateService } from 'src/utils/current-date-format';
import { ActivatedRoute } from '@angular/router';

const MESSAGE_MAX_CHARACTERS = 200;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    @Input() isHost: boolean;
    myName: string;
    roomId: string;
    messageForm: FormGroup;
    messages: Message[] = [];

    constructor(
        public socketService: SocketClientService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
    ) {
        const roomId = this.route.snapshot.paramMap.get('id');
        if (roomId) {
            this.roomId = roomId;
            this.messageForm = this.formBuilder.group({
                message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
            });
            if (this.isHost) this.getUsername();
            else this.myName = 'Organisateur';
            this.getRoomMessages();
            this.configureBaseSocketFeatures();
        }
    }

    sendMessage() {
        const newMessageContent: string = this.messageForm.get('message')?.value;
        if (this.messageForm.get('message')?.valid && newMessageContent.trim()) {
            const newMessage: Message = { sender: this.myName, content: newMessageContent, time: getCurrentDateService() };
            this.socketService.send('new message', { roomId: Number(this.roomId), message: newMessage });
            this.messageForm.get('message')?.setValue('');
        }
    }

    private getRoomMessages() {
        this.socketService.send('get messages', Number(this.roomId), (messages: Message[]) => {
            this.messages = messages ?? [];
        });
    }

    private getUsername() {
        this.socketService.send('get username', Number(this.roomId), (name: string) => {
            this.myName = name;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('message received', (message: Message) => {
            this.messages.push(message);
        });
    }
}
