import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-room-code-prompt',
    templateUrl: './room-code-prompt.component.html',
    styleUrls: ['./room-code-prompt.component.scss'],
})
export class RoomCodePromptComponent implements OnInit {
    @Output() sendRoomData: EventEmitter<number> = new EventEmitter<number>();
    @Output() validationDone: EventEmitter<boolean> = new EventEmitter<boolean>();
    isLocked: boolean = false;
    isActive: boolean = true;
    isRoomIdValid: boolean = false;
    isUsernameValid: boolean = false;
    roomId: string | undefined;
    username: string | undefined;
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

    sendValidationDone() {
        this.validationDone.emit(this.isActive);
    }

    validateRoomId() {
        if (this.isOnlyDigit()) this.sendRoomId();
        else this.roomIdClientValidation();
    }

    validateUsername() {
        // Check if the username is undefined or contains only whitespace
        if (this.username === undefined || /^\s*$/.test(this.username)) {
            this.error = "Le nom de l'utilisateur doit contenir au moins un caractère !";
            this.showErrorFeedback();
        } else {
            this.sendUsername();
            this.reset();
        }
    }

    joinRoom() {
        this.sendJoinRoomRequest();
        this.sendRoomIdToWaitingRoom();
        this.isActive = false;
        this.sendValidationDone();
    }

    private roomIdClientValidation() {
        if (!this.isOnlyDigit()) {
            this.error = 'Votre code doit contenir seulement 4 chiffre (ex: 1234)';
            this.showErrorFeedback();
        } else {
            this.reset();
        }
    }

    private isOnlyDigit() {
        return this.roomId?.match('[0-9]{4}');
    }

    private sendJoinRoomRequest() {
        this.socketService.send('player join', { roomId: Number(this.roomId), username: this.username }, (isLocked: boolean) => {
            if (isLocked) {
                this.isLocked = true;
                this.showErrorFeedback();
            } else {
                this.isLocked = false;
                this.reset();
            }
        });
    }

    private sendUsername() {
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

    private sendRoomId() {
        this.socketService.send('validate roomID', Number(this.roomId), (isValid: boolean) => {
            if (!isValid) {
                this.showErrorFeedback();
                this.error = 'Le code ne correspond a aucune partie en cours. Veuillez réessayer';
            } else {
                this.isRoomIdValid = isValid;
                this.reset();
            }
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
