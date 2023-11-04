import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-room-code-prompt',
    templateUrl: './room-code-prompt.component.html',
    styleUrls: ['./room-code-prompt.component.scss'],
})
export class RoomCodePromptComponent implements OnInit {
    @Output() sendRoomData: EventEmitter<number> = new EventEmitter<number>();
    @Output() sendUsernameData: EventEmitter<string> = new EventEmitter<string>();
    @Output() validationDone: EventEmitter<boolean> = new EventEmitter<boolean>();
    isLocked: boolean = false;
    isActive: boolean = true;
    isRoomIdValid: boolean = false;
    isUsernameValid: boolean = false;
    roomId: string | undefined;
    username: string = '';
    inputBorderColor: string;
    error: string | undefined;
    textColor: string;

    constructor(private socketService: SocketClientService) {}

    ngOnInit() {
        this.connect();
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }
    }

    sendRoomIdToWaitingRoom() {
        this.sendRoomData.emit(Number(this.roomId));
    }

    sendUsernameToWaitingRoom() {
        this.sendUsernameData.emit(this.username);
    }

    sendValidationDone() {
        this.validationDone.emit(this.isActive);
    }

    async validateRoomId() {
        if (this.isOnlyDigit()) await this.sendRoomId();
        else this.roomIdClientValidation();
    }

    async validateUsername() {
        const whitespacePattern = /^\s*$/;
        if (this.username === undefined || whitespacePattern.test(this.username)) {
            this.error = "Le nom de l'utilisateur doit contenir au moins un caractère!";
            this.showErrorFeedback();
        } else if (this.username?.toLowerCase() === 'organisateur') {
            this.error = "Le nom de l'utilisateur ne peut pas être Organisateur!";
            this.showErrorFeedback();
        } else {
            await this.sendUsername();
        }
    }

    async joinRoom() {
        await this.sendJoinRoomRequest();
        if (!this.isLocked && this.isRoomIdValid) {
            this.sendRoomIdToWaitingRoom();
            this.sendUsernameToWaitingRoom();
            this.isActive = false;
            this.sendValidationDone();
        }
    }

    private roomIdClientValidation() {
        if (!this.isOnlyDigit()) {
            this.error = 'Votre code doit contenir seulement 4 chiffres (ex: 1234)';
            this.showErrorFeedback();
        } else {
            this.reset();
        }
    }

    private isOnlyDigit() {
        return this.roomId?.match('[0-9]{4}');
    }

    private async sendJoinRoomRequest() {
        await this.sendRoomId();
        if (this.isRoomIdValid) {
            return new Promise<void>((resolve) => {
                this.socketService.send('player join', { roomId: Number(this.roomId), username: this.username }, (isLocked: boolean) => {
                    if (isLocked) {
                        this.isLocked = true;
                        this.showErrorFeedback();
                    } else {
                        this.isLocked = false;
                        this.reset();
                    }
                    resolve();
                });
            });
        }
    }

    private async sendUsername() {
        await this.sendRoomId();
        if (this.isRoomIdValid) {
            this.socketService.send(
                'validate username',
                { roomId: Number(this.roomId), username: this.username },
                (data: { isValid: boolean; error: string }) => {
                    if (!data.isValid) {
                        this.showErrorFeedback();
                        this.error = data.error;
                    } else {
                        this.isUsernameValid = data.isValid;
                        this.reset();
                    }
                },
            );
        }
    }

    private async sendRoomId() {
        return new Promise<void>((resolve) => {
            this.socketService.send('validate roomID', Number(this.roomId), (data: { isRoom: boolean; isLocked: boolean }) => {
                if (!data.isRoom) {
                    this.isRoomIdValid = false;
                    this.isUsernameValid = false;
                    this.showErrorFeedback();
                    this.error = 'Le code ne correspond a aucune partie en cours. Veuillez réessayer';
                } else if (data.isLocked) {
                    this.isRoomIdValid = false;
                    this.isUsernameValid = false;
                    this.showErrorFeedback();
                    this.error = 'La partie est vérouillée. Veuillez réessayer.';
                } else {
                    this.isRoomIdValid = true;
                    this.reset();
                }
                resolve();
            });
        });
    }

    private reset() {
        this.textColor = '';
        this.inputBorderColor = '';
        this.error = '';
    }

    private showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
