import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { HostInterfaceManagementService } from '@app/services/host-interface-management.service/host-interface-management.service';

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
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
        return (!this.gameService.gameRealService.locked && !this.gameService.gameRealService.validated) || this.isLastButton;
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
