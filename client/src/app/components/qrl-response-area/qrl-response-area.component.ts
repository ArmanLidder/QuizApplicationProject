import { Component, OnDestroy } from '@angular/core';
import {
    DEBOUNCE_INACTIVE_TIME,
    INACTIVITY_TIME,
    MAX_RESPONSE_CHARACTERS,
} from '@app/components/qrl-response-area/qrl-response-area.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { MAX_PERCENTAGE } from '@app/components/game-interface/game-interface.component.const';

@Component({
    selector: 'app-qrl-response-area',
    templateUrl: './qrl-response-area.component.html',
    styleUrls: ['./qrl-response-area.component.scss'],
})
export class QrlResponseAreaComponent implements OnDestroy {
    private inactiveTimeout: number = 0;
    private inputTimer: number = 0;
    private validateTimer: number = 0;
    constructor(
        private socketClientService: SocketClientService,
        public gameService: GameService,
    ) {}

    ngOnDestroy() {
        this.gameService.isActive = false;
        this.gameService.hasInteracted = false;
        clearTimeout(this.inputTimer);
        clearTimeout(this.inactiveTimeout);
        clearTimeout(this.validateTimer);
    }

    handleActiveUser() {
        if (!this.gameService.isActive) {
            this.sendActiveNotice();
        }
        if (!this.gameService.hasInteracted) {
            this.sendInteractionNotice();
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
            this.gameService.isActive = false;
            if (this.socketClientService.isSocketAlive())
                this.socketClientService.send(socketEvent.SEND_ACTIVITY_STATUS, { roomId: this.gameService.gameRealService.roomId, isActive: false });
        }, INACTIVITY_TIME);
    }

    obtainedPoints() {
        if (this.gameService.lastQrlScore) return (this.gameService.lastQrlScore / MAX_PERCENTAGE) * (this.gameService.question?.points as number);
        return 0;
    }

    private sendActiveNotice() {
        this.gameService.isActive = true;
        if (this.socketClientService.isSocketAlive())
            this.socketClientService.send(socketEvent.SEND_ACTIVITY_STATUS, { roomId: this.gameService.gameRealService.roomId, isActive: true });
    }

    private sendInteractionNotice() {
        this.gameService.hasInteracted = true;
        if (this.socketClientService.isSocketAlive())
            this.socketClientService.send(socketEvent.NEW_RESPONSE_INTERACTION, this.gameService.gameRealService.roomId);
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

    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/member-ordering
    protected readonly MAX_RESPONSE_CHARACTERS = MAX_RESPONSE_CHARACTERS;
}
