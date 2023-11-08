import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { errorDictionary } from '@common/browser-message/error-message/error-message';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { RoomValidationResult } from '@common/interfaces/socket-manager.interface';

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
    inputBorderColor: string = '';
    error: string | undefined = '';
    textColor: string = '';

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
            this.error = errorDictionary.charNumError;
            this.showErrorFeedback();
        } else if (this.username?.toLowerCase() === 'organisateur') {
            this.error = errorDictionary.organiserNameError;
            this.showErrorFeedback();
        } else {
            await this.sendUsername();
        }
    }

    async joinRoom() {
        await this.sendJoinRoomRequest();
        if (!this.isLocked && this.isRoomIdValid && this.isUsernameValid) {
            this.sendRoomIdToWaitingRoom();
            this.sendUsernameToWaitingRoom();
            this.isActive = false;
            this.sendValidationDone();
        }
    }

    private roomIdClientValidation() {
        if (!this.isOnlyDigit()) {
            this.error = errorDictionary.validationCodeError;
            this.showErrorFeedback();
        } else {
            this.reset();
        }
    }

    private isOnlyDigit() {
        return this.roomId?.match('[0-9]{4}');
    }

    private async sendJoinRoomRequest() {
        await this.sendUsername();
        if (this.isRoomIdValid && this.isUsernameValid) {
            return new Promise<void>((resolve) => {
                this.handleJoinRoomValidation();
                resolve();
            });
        }
    }

    private async sendUsername() {
        await this.sendRoomId();
        if (this.isRoomIdValid) {
            return new Promise<void>((resolve) => {
                this.handleUsernameValidation();
                resolve();
            });
        }
    }

    private async sendRoomId() {
        return new Promise<void>((resolve) => {
            this.handleRoomIdValidation();
            resolve();
        });
    }

    private handleUsernameValidation() {
        this.socketService.send(
            socketEvent.validateUsername,
            { roomId: Number(this.roomId), username: this.username },
            (data: { isValid: boolean; error: string }) => {
                if (!data.isValid) {
                    this.isUsernameValid = data.isValid;
                    this.showErrorFeedback();
                    this.error = data.error;
                } else {
                    this.isUsernameValid = data.isValid;
                    this.reset();
                }
            },
        );
    }

    private handleRoomIdValidation() {
        this.socketService.send(socketEvent.validateRoomId, Number(this.roomId), (data: RoomValidationResult) => {
            if (!data.isRoom) {
                this.handleErrors();
                this.error = errorDictionary.roomCodeExpired;
            } else if (data.isLocked) {
                this.handleErrors();
                this.error = errorDictionary.roomLocked;
            } else {
                this.isRoomIdValid = true;
                this.reset();
            }
        });
    }

    private handleJoinRoomValidation() {
        this.socketService.send(socketEvent.joinGame, { roomId: Number(this.roomId), username: this.username }, (isLocked: boolean) => {
            if (isLocked) {
                this.isLocked = true;
                this.showErrorFeedback();
            } else {
                this.isLocked = false;
                this.reset();
            }
        });
    }

    private handleErrors() {
        this.isRoomIdValid = false;
        this.isUsernameValid = false;
        this.showErrorFeedback();
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
