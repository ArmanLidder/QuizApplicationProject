import { Component, OnDestroy } from '@angular/core';
import {
    DEBOUNCE_INACTIVE_TIME,
    INACTIVITY_TIME,
    MAX_RESPONSE_CHARACTERS,
} from '@app/components/qrl-response-area/qrl-response-area.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

@Component({
    selector: 'app-qrl-response-area',
    templateUrl: './qrl-response-area.component.html',
    styleUrls: ['./qrl-response-area.component.scss'],
})
export class QrlResponseAreaComponent implements OnDestroy {
    inactiveTimeout: number = 0;
    isActive: boolean = false;
    hasInteracted: boolean = false;
    charactersLeft: number = MAX_RESPONSE_CHARACTERS;
    inputTimer: number = 0;
    validateTimer: number = 0;
    constructor(
        private socketClientService: SocketClientService,
        public gameService: GameService,
    ) {}

    ngOnDestroy() {
        this.isActive = false;
        this.hasInteracted = false;
        clearTimeout(this.inputTimer);
        clearTimeout(this.inactiveTimeout);
        clearTimeout(this.validateTimer);
    }

    handleActiveUser() {
        this.charactersLeft = MAX_RESPONSE_CHARACTERS - this.gameService.qrlAnswer.length;
        if (!this.isActive) {
            this.isActive = true;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send(socketEvent.sendActivityStatus, { roomId: this.gameService.gameRealService.roomId, isActive: true });
        }
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send(socketEvent.newResponseInteraction, this.gameService.gameRealService.roomId);
        }
        this.resetInputTimer();
    }

    validate() {
        this.gameService.isHostEvaluating = true;
        this.gameService.sendAnswer();
        this.ngOnDestroy();
    }

    onInputStopped(): void {
        this.inactiveTimeout = window.setTimeout(() => {
            this.isActive = false;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send(socketEvent.sendActivityStatus, { roomId: this.gameService.gameRealService.roomId, isActive: false });
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
