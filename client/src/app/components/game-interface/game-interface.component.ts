import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionType } from '@common/enums/question-type.enum';
import {
    GameInterfaceManagementService
} from '@app/services/game-interface-management.service/game-interface-management.service';
import { HOST_USERNAME } from '@common/names/host-username';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';


@Component({
    selector: 'app-game-interface',
    templateUrl: './game-interface.component.html',
    styleUrls: ['./game-interface.component.scss'],
})
export class GameInterfaceComponent implements OnInit, OnDestroy {
    private interactiveListService: InteractiveListSocketService;

    constructor(public gameInterfaceManagementService: GameInterfaceManagementService,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        console.log(this.gameInterfaceManagementService.gameService.username);
        if (this.gameInterfaceManagementService.gameService.username !== HOST_USERNAME) {
            console.log('game interface component ngOnInit');
            this.gameInterfaceManagementService.gameService.isTestMode = this.route.snapshot.url[0].path === 'quiz-testing-page';
            const pathId = this.route.snapshot.paramMap.get('id') as string;
            this.gameInterfaceManagementService.setup(pathId);
        }
    }

    ngOnDestroy() {
        console.log('ngOnDestroy called');
        this.gameInterfaceManagementService.reset();
    }

    get score() {
        this.gameInterfaceManagementService.playerScore = this.gameInterfaceManagementService.gameService.isTestMode ? this.gameInterfaceManagementService.gameService.playerScore : this.gameInterfaceManagementService.playerScore;
        return this.gameInterfaceManagementService.playerScore;
    }

    get bonusStatus() {
        this.gameInterfaceManagementService.isBonus = this.gameInterfaceManagementService.gameService.isTestMode ? this.gameInterfaceManagementService.gameService.isBonus : this.gameInterfaceManagementService.isBonus;
        return this.gameInterfaceManagementService.isBonus;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
