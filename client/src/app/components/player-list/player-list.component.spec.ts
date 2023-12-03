import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SortType } from '@app/components/player-list/player-list.component.const';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';
import { playerStatus } from '@common/player-status/player-status';
import { PlayerListComponent } from './player-list.component';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let interactiveListService: InteractiveListSocketService;
    let getPlayersListSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [
                InteractiveListSocketService,
                SortListService,
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
            ],
        });
        TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        TestBed.inject(SortListService);
        interactiveListService = TestBed.inject(InteractiveListSocketService);
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        interactiveListService.players = [
            ['karim', 0, 0, playerStatus.LEFT, true],
            ['player1', 0, 0, playerStatus.INTERACTION, true],
        ];
        component['order'] = 1;
        component.orderIcon = 'fa-solid fa-up-long';
        getPlayersListSpy = spyOn(interactiveListService, 'getPlayersList');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change order correctly', () => {
        const expectedValue = -1;
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
        expect(component['order']).toEqual(expectedValue);
        expect(component.orderIcon).toEqual('fa-solid fa-down-long');
        getPlayersListSpy.calls.reset();
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
        expect(component['order']).toEqual(1);
        expect(component.orderIcon).toEqual('fa-solid fa-up-long');
    });

    it('should sort by status', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SortByStatus);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SortByStatus);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should sort by score', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SortByScore);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SortByScore);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should sort by name', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sort(SortType.SortByName);
        expect(updateOptionSelections).toHaveBeenCalledWith(SortType.SortByName);
        expect(getPlayersListSpy).toHaveBeenCalledWith(undefined, undefined, false);
    });

    it('should toggle Chat Permission', () => {
        const toggleSpy = spyOn(interactiveListService, 'toggleChatPermission');
        component.roomId = 1;
        interactiveListService.players = [['karim', 0, 0, playerStatus.LEFT, true]];
        component.toggleChatPermission('karim');
        expect(toggleSpy).toHaveBeenCalledWith('karim', 1);
    });

    it('should correctly modify optionSelections', () => {
        const expectedResult = new Map([
            [SortType.SortByName, false],
            [SortType.SortByScore, true],
            [SortType.SortByStatus, false],
        ]);
        component.optionSelections = new Map([
            [SortType.SortByName, true],
            [SortType.SortByScore, false],
            [SortType.SortByStatus, false],
        ]);
        component['updateOptionSelections'](SortType.SortByScore);
        expect(component.optionSelections).toEqual(expectedResult);
    });
});
