import { Component, EventEmitter, Output } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-room-code-prompt',
    templateUrl: './room-code-prompt.component.html',
    styleUrls: ['./room-code-prompt.component.scss'],
})

export class RoomCodePromptComponent {
    @Output() toggleView: EventEmitter<boolean> = new EventEmitter<boolean>();
    isRoomIdValid: boolean = false;
    isUsernameValid: boolean = false;
    roomId: string | undefined;
    username: string | undefined;
    inputBorderColor: string;
    error: string | undefined;
    textColor: string;

    constructor(private socketServices: SocketClientService, private router: Router) {}

    ngOnInit() {
        this.connect();
    }

    connect(){
        this.socketServices.connect();
    }

    returnToHomePage() {
        this.toggleView.emit(false);
    }

    validateRoomId() {
        this.sendRoomId();
    }

    validateUsername(){
        this.sendUsername()
    }

    joinRoom() {
        this.sendJoinRoomRequest();
    }

    private sendJoinRoomRequest() {
        this.socketServices.send('player join', {roomId: Number(this.roomId), username: this.username}, () => {
            this.router.navigate(['/waiting-room-player-page'])
        })
    }
    private sendUsername() {
        this.socketServices.send('validate username', {roomId: Number(this.roomId), username: this.username}, (data: {isValid:boolean, error:string}) => {
            if (!data.isValid){
                this.showErrorFeedback()
                this.error = data.error;
            } else {
                this.isUsernameValid = data.isValid;
                this.reset();
            }
        })
    }

    private sendRoomId() {
        this.socketServices.send('validate roomID', Number(this.roomId), (isValid:boolean) => {
            console.log(isValid);
            if (!isValid) {
                this.showErrorFeedback()
                this.error = 'Le code ne correspond a aucune partie en cours. Veuillez réessayer'
            } else {
                this.isRoomIdValid = isValid;
                this.reset()
            }
        })
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
