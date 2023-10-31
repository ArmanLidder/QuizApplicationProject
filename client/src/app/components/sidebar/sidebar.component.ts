import { Component, Input, Injector } from '@angular/core';
import { Message } from '@common/interfaces/message.interface';
import { SocketClientService } from '@app/services/socket-client.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getCurrentDateService } from 'src/utils/current-date-format';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game.service';

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
        if (this.messageForm.get('message')?.valid && newMessageContent.trim()) {
            const newMessage: Message = { sender: this.myName, content: newMessageContent, time: getCurrentDateService() };
            this.socketService.send('new message', { roomId: Number(this.roomId), message: newMessage });
            this.messageForm.get('message')?.setValue('');
        }
    }

    onChatFocus() {
        this.gameService.isInputFocused = true;
    }

    onChatBlur() {
        this.gameService.isInputFocused = false;
    }

    // onChatKeyup(event: KeyboardEvent) {
    //     this.customKeyup.emit(event);
    // }

    private setup() {
        if (this.socketService.isSocketAlive()) {
            this.getUsername();
            this.getRoomMessages();
            this.configureBaseSocketFeatures();
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
