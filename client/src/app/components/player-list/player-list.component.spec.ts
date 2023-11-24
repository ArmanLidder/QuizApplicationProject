import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerListComponent } from './player-list.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { playerStatus } from '@common/player-status/player-status';
import { SortListService } from '@app/services/sort-list.service/sort-list.service';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let socketService: SocketClientServiceTestHelper;
    let getPlayersListSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            providers: [SortListService, SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        TestBed.inject(SortListService);
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.players = [
            ['karim', 0, 0, playerStatus.left, true],
            ['player1', 0, 0, playerStatus.interaction, true],
        ];
        component.order = 1;
        component.orderIcon = 'fa-solid fa-up-long';
        getPlayersListSpy = spyOn(component, 'getPlayersList');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should change order correctly', () => {
        const expectedValue = -1;
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(false);
        expect(component.order).toEqual(expectedValue);
        expect(component.orderIcon).toEqual('fa-solid fa-down-long');
        getPlayersListSpy.calls.reset();
        component.changeOrder();
        expect(getPlayersListSpy).toHaveBeenCalledWith(false);
        expect(component.order).toEqual(1);
        expect(component.orderIcon).toEqual('fa-solid fa-up-long');
    });

    it('should sort by status', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sortByStatus();
        expect(updateOptionSelections).toHaveBeenCalledWith('byStatus');
        expect(getPlayersListSpy).toHaveBeenCalledWith(false);
    });

    it('should sort by score', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sortByScore();
        expect(updateOptionSelections).toHaveBeenCalledWith('byScore');
        expect(getPlayersListSpy).toHaveBeenCalledWith(false);
    });

    it('should sort by name', () => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const updateOptionSelections = spyOn(component, 'updateOptionSelections' as any);
        component.sortByName();
        expect(updateOptionSelections).toHaveBeenCalledWith('byName');
        expect(getPlayersListSpy).toHaveBeenCalledWith(false);
    });

    it('should toggle Chat Permission', () => {
        const sendSpy = spyOn(socketService, 'send');
        component.roomId = 1;
        component.players = [['karim', 0, 0, playerStatus.left, true]];
        component.toggleChatPermission('karim');
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.toggleChatPermission, { roomId: 1, username: 'karim' });
    });

    it('should check if a player has left', () => {
        component.leftPlayers = [['test', 0, 0, playerStatus.left, true]];
        const resultTrue = component.isPlayerGone('test');
        expect(resultTrue).toBeTruthy();
        component.leftPlayers = [];
        const resultFalse = component.isPlayerGone('test');
        expect(resultFalse).toBeFalsy();
    });

    it('should change player status', () => {
        const statusIndex = 3;
        component.players = [['test', 0, 0, playerStatus.noInteraction, true]];
        component['changePlayerStatus']('test', playerStatus.left);
        expect(component.players[0][statusIndex]).toEqual(playerStatus.left);
        component['changePlayerStatus']('NotFound', playerStatus.left);
    });

    it('should correctly modify optionSelections', () => {
        const expectedResult = new Map([
            ['byName', false],
            ['byScore', true],
            ['byStatus', false],
        ]);
        component.optionSelections = new Map([
            ['byName', true],
            ['byScore', false],
            ['byStatus', false],
        ]);
        component['updateOptionSelections']('byScore');
        expect(component.optionSelections).toEqual(expectedResult);
    });

    it('should return the right index when searching for player', () => {
        const noResult = -1;
        const player = component['findPlayer']('test', [['test', 0, 0, playerStatus.validation, true]]);
        expect(player).toEqual(0);
        const noPlayer = component['findPlayer']('test', []);
        expect(noPlayer).toEqual(noResult);
    });

    it('should init player status correctly', () => {
        component.players = [['test', 0, 0, playerStatus.validation, true]];
        component.leftPlayers = [['isGone', 0, 0, playerStatus.left, true]];
        component.actualStatus = component.players;
        const playerLeft = component['initPlayerStatus']('isGone', true);
        expect(playerLeft).toEqual(playerStatus.left);
        const actualStatus = component['initPlayerStatus']('test', false);
        expect(actualStatus).toEqual(playerStatus.validation);
        component.isFinal = false;
        const isNotFinal = component['initPlayerStatus']('test', true);
        expect(isNotFinal).toEqual(playerStatus.noInteraction);
        component.isFinal = true;
        const isFinal = component['initPlayerStatus']('test', true);
        expect(isFinal).toEqual(playerStatus.endGame);
    });

    it('should configure the right socket event listener', () => {
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const changePlayerStatusSpy = spyOn(component, 'changePlayerStatus' as any);
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.updateInteraction);
        expect(secondEvent).toEqual(socketEvent.submitAnswer);
        if (typeof firstAction === 'function') {
            firstAction('test');
            expect(changePlayerStatusSpy).toHaveBeenCalledWith('test', playerStatus.interaction);
            changePlayerStatusSpy.calls.reset();
        }
        if (typeof secondAction === 'function') {
            secondAction('test');
            expect(changePlayerStatusSpy).toHaveBeenCalledWith('test', playerStatus.validation);
        }
    });

    it('should get actual status', () => {
        component.players = [['test', 0, 0, playerStatus.endGame, true]];
        component.actualStatus = component.players;
        const playerLeft = component['getActualStatus']('test');
        expect(playerLeft).toEqual(playerStatus.endGame);
    });

    it('should sortPlayerByScore and verify if user can talk', () => {
        spyOn(component, 'initPlayerStatus' as any).and.returnValue(playerStatus.endGame);
        component.players = [['test', 0, 0, playerStatus.endGame, true]];
        component.actualStatus = [];
        const first = component['canPlayerChat']('test');
        expect(first).toBeTruthy();
        component.actualStatus = [['test', 0, 0, playerStatus.endGame, false]];
        const second = component['canPlayerChat']('test');
        expect(second).toBeFalsy();
    });
});
