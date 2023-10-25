import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Message } from '@common/interfaces/message.interface';
import { SocketClientService } from '@app/services/socket-client.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getCurrentDateService } from 'src/utils/current-date-format';

const MESSAGE_MAX_CHARACTERS = 200;

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges {
    @Input() roomId: number;
    @Input() myName: string;
    messageForm: FormGroup;
    messages: Message[] = [];

    constructor(
        public socketService: SocketClientService,
        private formBuilder: FormBuilder,
    ) {
        this.messageForm = this.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.roomId) {
            if (this.roomId) {
                this.getRoomMessages();
                this.configureBaseSocketFeatures();
            }
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

    private configureBaseSocketFeatures() {
        this.socketService.on('message received', (message: Message) => {
            this.messages.push(message);
        });
    }
}
