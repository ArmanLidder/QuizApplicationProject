import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { HostInterfaceManagementService } from '@app/services/host-interface-management.service/host-interface-management.service';
import { QrlEvaluationService } from '@app/services/qrl-evaluation.service/qrl-evaluation.service';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
    qrlEvaluationService: QrlEvaluationService = inject(QrlEvaluationService);
    protected readonly timerMessage = timerMessage;
    private isLastButton: boolean = false;
    private route: ActivatedRoute = inject(ActivatedRoute);

    constructor(
        public gameService: GameService,
        public hostInterfaceManagerService: HostInterfaceManagementService,
        private readonly socketService: SocketClientService,
    ) {
        if (this.socketService.isSocketAlive()) this.hostInterfaceManagerService.configureBaseSocketFeatures();
        this.gameService.init(this.route.snapshot.paramMap.get('id') as string);
    }

    isDisabled() {
        const duringEvaluation = !this.qrlEvaluationService.isCorrectionFinished && this.hostInterfaceManagerService.isHostEvaluating;
        return (!this.gameService.gameRealService.locked && !this.gameService.gameRealService.validated) || this.isLastButton || duringEvaluation;
    }

    updateHostCommand() {
        return this.gameService.gameRealService.isLast ? 'Montrer résultat' : 'Prochaine question';
    }

    handleHostCommand() {
        this.hostInterfaceManagerService.saveStats();
        if (this.gameService.gameRealService.isLast) {
            this.hostInterfaceManagerService.handleLastQuestion();
            this.isLastButton = true;
        } else {
            this.hostInterfaceManagerService.requestNextQuestion();
        }
    }
}
