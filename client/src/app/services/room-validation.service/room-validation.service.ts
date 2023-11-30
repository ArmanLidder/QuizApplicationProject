import { Injectable } from '@angular/core';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { RoomValidationResult, UsernameValidation } from '@common/interfaces/socket-manager.interface';
import { errorDictionary } from '@common/browser-message/error-message/error-message';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class RoomValidationService {
    isActive: boolean = true;
    isLocked: boolean = false;
    isRoomIdValid: boolean = false;
    isUsernameValid: boolean = false;
    roomId: string | undefined = '';
    username: string = '';

    constructor(private socketService: SocketClientService) {}

    resetService() {
        this.isActive = true;
        this.isLocked = false;
        this.isRoomIdValid = false;
        this.isUsernameValid = false;
        this.roomId = '';
        this.username = '';
    }

    async verifyRoomId() {
        return this.isOnlyDigit() ? await this.sendRoomId() : errorDictionary.validationCodeError;
    }

    async verifyUsername() {
        const whitespacePattern = /^\s*$/;
        const isFormatValid = this.username === undefined || whitespacePattern.test(this.username);
        const isHost = this.username?.toLowerCase() === 'organisateur';
        if (isFormatValid) return errorDictionary.charNumError;
        else if (isHost) return errorDictionary.organiserNameError;
        else return await this.sendUsername();
    }

    async sendJoinRoomRequest() {
        const error = await this.sendUsername();
        if (error !== '') return error;
        return new Promise<string>((resolve) => {
            const usernameData = { roomId: Number(this.roomId), username: this.username };
            this.socketService.send(socketEvent.joinGame, usernameData, (isLocked: boolean) => {
                resolve(this.handleJoiningRoomValidation(isLocked));
            });
        });
    }

    private async sendUsername() {
        const error = await this.sendRoomId();
        if (error !== '') return error;
        return new Promise<string>((resolve) => {
            const usernameData = { roomId: Number(this.roomId), username: this.username };
            this.socketService.send(socketEvent.validateUsername, usernameData, (data: UsernameValidation) => {
                resolve(this.handleUsernameValidation(data));
            });
        });
    }

    private async sendRoomId() {
        return new Promise<string>((resolve) => {
            this.socketService.send(socketEvent.validateRoomId, Number(this.roomId), (data: RoomValidationResult) => {
                resolve(this.handleRoomIdValidation(data));
            });
        });
    }

    private handleJoiningRoomValidation(isLocked: boolean) {
        this.isLocked = isLocked;
        return isLocked ? this.handleErrors(errorDictionary.roomLocked) : '';
    }

    private handleUsernameValidation(data: UsernameValidation) {
        this.isUsernameValid = data.isValid;
        return data.isValid ? '' : data.error;
    }

    private handleRoomIdValidation(data: RoomValidationResult) {
        let error = '';
        if (!data.isRoom) error = this.handleErrors(errorDictionary.roomCodeExpired);
        else if (data.isLocked) error = this.handleErrors(errorDictionary.roomLocked);
        else this.isRoomIdValid = true;
        return error;
    }

    private handleErrors(errorType: string) {
        this.isRoomIdValid = false;
        this.isUsernameValid = false;
        return errorType;
    }

    private isOnlyDigit() {
        return this.roomId?.match('[0-9]{4}');
    }
}
