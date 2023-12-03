import { Component, Input } from '@angular/core';
import {
    Player,
    ORDER_ICON_UP,
    SortType,
    ORDER_INITIAL_MULTIPLIER,
    ORDER_MULTIPLIER,
    ORDER_ICON_DOWN,
} from '@app/components/player-list/player-list.component.const';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() leftPlayers: Player[];
    @Input() roomId: number;
    @Input() isHost: boolean;
    orderIcon = ORDER_ICON_UP;
    optionSelections: Map<SortType, boolean> = new Map([
        [SortType.SortByName, true],
        [SortType.SortByScore, false],
        [SortType.SortByStatus, false],
    ]);
    protected readonly sortType = SortType;
    private order = ORDER_INITIAL_MULTIPLIER;

    constructor(
        public interactiveListService: InteractiveListSocketService,
        private sortListService: SortListService,
    ) {}

    changeOrder() {
        this.order *= ORDER_MULTIPLIER;
        this.orderIcon = this.order !== ORDER_MULTIPLIER ? ORDER_ICON_UP : ORDER_ICON_DOWN;
        this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
    }

    sort(sortOption: SortType) {
        this.updateOptionSelections(sortOption);
        this.selectOptionMethod(sortOption);
        this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
    }

    sortAllPlayers(): Player[] {
        this.interactiveListService.players.sort((first: Player, second: Player) => this.order * this.sortListService.sortFunction(first, second));
        return this.interactiveListService.players;
    }

    toggleChatPermission(username: string) {
        this.interactiveListService.toggleChatPermission(username, this.roomId);
    }

    private selectOptionMethod(sortOption: SortType) {
        switch (sortOption) {
            case SortType.SortByName:
                this.sortListService.sortByName();
                break;
            case SortType.SortByScore:
                this.sortListService.sortByScore();
                break;
            case SortType.SortByStatus:
                this.sortListService.sortByStatus();
                break;
        }
    }

    private updateOptionSelections(selectedMethod: SortType) {
        this.optionSelections.forEach((isSelected, methodName) => {
            if (isSelected && methodName !== selectedMethod) this.optionSelections.set(methodName, false);
            else if (selectedMethod === methodName) this.optionSelections.set(methodName, true);
        });
    }
}
