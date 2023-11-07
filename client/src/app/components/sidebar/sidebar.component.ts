import { Component, Injector, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MESSAGE_MAX_CHARACTERS } from '@app/components/sidebar/sidebar.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Message } from '@common/interfaces/message.interface';
import { getCurrentDateService } from 'src/utils/current-date-format';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

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
    socketService: SocketClientService;
    formBuilder: FormBuilder;
    route: ActivatedRoute;
    gameService: GameService;

    constructor(injector: Injector) {
        this.socketService = injector.get<SocketClientService>(SocketClientService);
        this.formBuilder = injector.get<FormBuilder>(FormBuilder);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.gameService = injector.get<GameService>(GameService);

        const roomId = this.route.snapshot.paramMap.get('id');
        if (roomId) {
            this.roomId = roomId;
            this.setup();
        }
        this.messageForm = this.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
    }

    sendMessage() {
        const newMessageContent: string = this.messageForm.get('message')?.value;
        if (this.socketService.isSocketAlive()) {
            if (this.messageForm.get('message')?.valid && newMessageContent.trim()) {
                const newMessage: Message = { sender: this.myName, content: newMessageContent, time: getCurrentDateService() };
                this.socketService.send(socketEvent.newMessage, { roomId: Number(this.roomId), message: newMessage });
                this.messageForm.get('message')?.setValue('');
            }
        }
    }

    onChatFocus() {
        this.gameService.isInputFocused = true;
    }

    onChatBlur() {
        this.gameService.isInputFocused = false;
    }

    private setup() {
        if (this.socketService.isSocketAlive()) {
            this.getUsername();
            this.getRoomMessages();
            this.configureBaseSocketFeatures();
        }
    }

    private getRoomMessages() {
        this.socketService.send(socketEvent.getMessage, Number(this.roomId), (messages: Message[]) => {
            this.messages = messages ?? [];
        });
    }

    private getUsername() {
        this.socketService.send(socketEvent.getUsername, Number(this.roomId), (name: string) => {
            this.myName = name;
        });
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.receivedMessage, (message: Message) => {
            this.messages.push(message);
        });
    }
}
