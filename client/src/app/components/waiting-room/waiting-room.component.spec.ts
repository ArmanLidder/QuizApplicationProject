import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { WaitingRoomComponent } from './waiting-room.component';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

const DIGIT_CONSTANT = 1;
// Disable the eslint rule that changes any occurrence to unknown when running npm run lint:fix
// Because some spies are on private method
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
        });
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send room creation event if it is the host of the game', () => {
        const sendRoomCreationSpy = spyOn<any>(component, 'sendRoomCreation');
        const gatherPlayersSpy = spyOn<any>(component, 'gatherPlayers');
        component.isHost = true;
        component.ngOnInit();
        expect(sendRoomCreationSpy).toHaveBeenCalled();
        expect(gatherPlayersSpy).not.toHaveBeenCalled();
        expect(window.onbeforeunload).toEqual(jasmine.any(Function));
    });

    it('should not send room creation event if it is player joining game', () => {
        const sendRoomCreationSpy = spyOn<any>(component, 'sendRoomCreation');
        const gatherPlayersSpy = spyOn<any>(component, 'gatherPlayers');
        component.isHost = false;
        component.ngOnInit();
        expect(sendRoomCreationSpy).not.toHaveBeenCalled();
        expect(gatherPlayersSpy).toHaveBeenCalled();
        expect(window.onbeforeunload).toEqual(jasmine.any(Function));
    });

    it('should connect socket only if socket is not alive', () => {
        const connectSpy = spyOn(socketService, 'connect');
        const socketConfigureSpy = spyOn<any>(component, 'configureBaseSocketFeatures');
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        component.connect();
        expect(connectSpy).toHaveBeenCalled();
        expect(socketConfigureSpy).toHaveBeenCalled();
    });

    it('should not connect socket if socket is alive', () => {
        const connectSpy = spyOn(socketService, 'connect');
        const socketConfigureSpy = spyOn<any>(component, 'configureBaseSocketFeatures');
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        component.connect();
        expect(connectSpy).not.toHaveBeenCalled();
        expect(socketConfigureSpy).toHaveBeenCalled();
    });

    it('should call sendBanPlayer with username when banning player', () => {
        const sendBanPlayerSpy = spyOn<any>(component, 'sendBanPlayer');
        component.banPlayer('test');
        expect(sendBanPlayerSpy).toHaveBeenCalledWith('test');
    });

    it('should change room locked value on host action', () => {
        const sendToggleRoomLockSpy = spyOn<any>(component, 'sendToggleRoomLock');
        component.isRoomLocked = true;
        component.toggleRoomLocked();
        expect(sendToggleRoomLockSpy).toHaveBeenCalled();
    });

    it('should display the proper message if room is locked', () => {
        component.isRoomLocked = true;
        expect(component.setLockActionMessage()).toEqual('verrouillée');
        component.isRoomLocked = false;
        expect(component.setLockActionMessage()).toEqual('ouverte');
    });

    it('should send a start game signal when host starts game', () => {
        const sendStartSignalSpy = spyOn<any>(component, 'sendStartSignal');
        component.startGame();
        expect(sendStartSignalSpy).toHaveBeenCalled();
    });

    it('should send user input room id to server when joining room', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.roomId = DIGIT_CONSTANT + DIGIT_CONSTANT;
        component['sendRoomCreation']();
        const [event, quizId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(socketEvent.createRoom);
        expect(quizId).toEqual('1');
        if (typeof callback === 'function') {
            callback(DIGIT_CONSTANT);
            expect(component.roomId).toEqual(DIGIT_CONSTANT);
        }
    });

    it('should send ban player event to server on host action', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.roomId = DIGIT_CONSTANT;
        component['sendBanPlayer']('test');
        const [event, data] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(socketEvent.banPlayer);
        expect(data).toEqual({ roomId: DIGIT_CONSTANT, username: 'test' });
    });

    it('should send toggle room lock event to server on host action', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.roomId = DIGIT_CONSTANT;
        component['sendToggleRoomLock']();
        const [event, roomId] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(socketEvent.toggleRoomLock);
        expect(roomId).toEqual(DIGIT_CONSTANT);
    });

    it('should send start event to server on host action', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.roomId = DIGIT_CONSTANT;
        component['sendStartSignal']();
        const [event, roomId] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(socketEvent.start);
        expect(roomId).toEqual({ roomId: DIGIT_CONSTANT, time: 5 });
    });

    it('should remove the right player from the playùers list', () => {
        component.players = ['1', '2', '3', '4'];
        for (const player of component.players) {
            const length = component.players.length;
            component['removePlayer'](player);
            expect(component.players).not.toContain(player);
            expect(component.players.length).toEqual(length - DIGIT_CONSTANT);
        }
    });

    it('should send gather players username event to server on player entry', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.roomId = DIGIT_CONSTANT;
        component['gatherPlayers']();
        const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual(socketEvent.gatherPlayersUsername);
        expect(roomId).toEqual(DIGIT_CONSTANT);
        if (typeof callback === 'function') {
            callback(['1', '2']);
            expect(component.players).toEqual(['1', '2']);
        }
    });

    it('should configure the right socket event listener', () => {
        component.roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const routerSpy = spyOn(component['router'], 'navigate');
        const removePlayerSpy = spyOn<any>(component, 'removePlayer');
        component.players = ['1', '2', '3', '4'];
        component['configureBaseSocketFeatures']();
        const [
            [firstEvent, firstAction],
            [secondEvent, secondAction],
            [thirdEvent, thirdAction],
            [fourthEvent, fourthAction],
            [lastEvent, lastAction],
        ] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.newPlayer);
        expect(secondEvent).toEqual(socketEvent.removedFromGame);
        expect(thirdEvent).toEqual(socketEvent.removedPlayer);
        expect(fourthEvent).toEqual(socketEvent.time);
        expect(lastEvent).toEqual(socketEvent.finalTimeTransition);

        if (typeof firstAction === 'function') {
            firstAction(['1', '2', '3', '4', '5']);
            expect(component.players).toEqual(['1', '2', '3', '4', '5']);
        }
        if (typeof secondAction === 'function') {
            secondAction(DIGIT_CONSTANT);
            expect(routerSpy).toHaveBeenCalledWith(['/home']);
        }
        if (typeof thirdAction === 'function') {
            thirdAction('test');
            expect(removePlayerSpy).not.toHaveBeenCalled();
            thirdAction('1');
            expect(removePlayerSpy).toHaveBeenCalledWith('1');
        }
        if (typeof fourthAction === 'function') {
            routerSpy.calls.reset();
            fourthAction(0);
            expect(component.isGameStarting).toBeTruthy();
            expect(routerSpy).toHaveBeenCalledWith(['game', DIGIT_CONSTANT]);
        }
        if (typeof lastAction === 'function') {
            routerSpy.calls.reset();
            lastAction(DIGIT_CONSTANT);
            expect(component.isTransition).toBeTruthy();
            expect(routerSpy).toHaveBeenCalledWith(['/']);
        }
    });

    it('should send stop timer signal to server', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component.stopTimer();
        const [eventName, roomId] = sendSpy.calls.mostRecent().args;
        expect(eventName).toEqual(socketEvent.stopTimer);
        expect(roomId).toEqual(component.roomId);
    });
});
