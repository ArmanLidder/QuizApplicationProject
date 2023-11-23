import { Component, OnDestroy } from '@angular/core';
import {
    DEBOUNCE_INACTIVE_TIME,
    INACTIVITY_TIME,
    MAX_RESPONSE_CHARACTERS,
} from '@app/components/qrl-response-area/qrl-response-area.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';

@Component({
    selector: 'app-qrl-response-area',
    templateUrl: './qrl-response-area.component.html',
    styleUrls: ['./qrl-response-area.component.scss'],
})
export class QrlResponseAreaComponent implements OnDestroy {
    canWrite: boolean = false;
    inactiveTimeout: number = 0;
    isActive: boolean = false;
    hasInteracted: boolean = false;
    charactersLeft: number = MAX_RESPONSE_CHARACTERS;
    inputTimer: number = 0;
    validateTimer: number = 0;
    firstTimeInput: boolean = true;
    oneTimeValidate: boolean = true;
    constructor(
        private socketClientService: SocketClientService,
        public gameService: GameService,
    ) {
        this.validateTimeOut();
    }

    ngOnDestroy() {
        this.isActive = false;
        this.hasInteracted = false;
        clearTimeout(this.inputTimer);
        clearTimeout(this.inactiveTimeout);
        clearTimeout(this.validateTimer);
        if (!this.oneTimeValidate && !this.firstTimeInput) {
            this.oneTimeValidate = true;
            this.firstTimeInput = true;
        }
    }

    handleActiveUser() {
        this.charactersLeft = MAX_RESPONSE_CHARACTERS - this.gameService.qrlAnswer.length;
        if (!this.isActive) {
            this.isActive = true;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send('sendActivityStatus', { roomId: this.gameService.gameRealService.roomId, isActive: true });
        }
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send('newResponseInteraction', { roomId: this.gameService.gameRealService.roomId });
        }
        this.resetInputTimer();
        if (this.firstTimeInput) {
            this.firstTimeInput = false;
            this.validateTimeOut();
        }
    }

    validateTimeOut() {
        this.validateTimer = window.setTimeout(() => {
            if (this.oneTimeValidate) {
                this.oneTimeValidate = false;
                this.validate();
                console.log(this.gameService.timer);
            }
        }, (this.gameService.timer - 1) * 1000);
    }

    validate() {
        this.canWrite = true;
        this.gameService.isHostEvaluating = true;
        this.gameService.sendAnswer();
        this.ngOnDestroy();
    }

    onInputStopped(): void {
        this.inactiveTimeout = window.setTimeout(() => {
            this.isActive = false;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send('sendActivityStatus', { roomId: this.gameService.gameRealService.roomId, isActive: false });
        }, INACTIVITY_TIME);
    }

    private setupInputDebounce(): void {
        this.inputTimer = window.setTimeout(() => {
            this.onInputStopped();
        }, DEBOUNCE_INACTIVE_TIME);
    }

    private resetInputTimer(): void {
        clearTimeout(this.inputTimer);
        clearTimeout(this.inactiveTimeout);
        this.setupInputDebounce();
    }
}
