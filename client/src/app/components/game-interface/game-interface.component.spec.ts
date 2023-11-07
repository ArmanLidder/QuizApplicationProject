import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { GameInterfaceComponent } from './game-interface.component';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

describe('GameInterfaceComponent', () => {
    let component: GameInterfaceComponent;
    let fixture: ComponentFixture<GameInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    let onSpy: jasmine.Spy;
    let sendSpy: jasmine.Spy;
    const mockScore: Score = {
        points: 1,
        bonusCount: 1,
        isBonus: true,
    };
    const mockTimeValue = 123;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [GameInterfaceComponent, PlayerListComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' }, url: [{ path: 'url-path' }] } } },
            ],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        fixture = TestBed.createComponent(GameInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        onSpy = spyOn(socketService, 'on').and.callThrough();
        sendSpy = spyOn(socketService, 'send').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should configure base socket features for end question correctly', () => {
        component.gameService.gameRealService.username = 'test';
        spyOnProperty(component.gameService, 'username', 'get').and.returnValue('test');
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[0];
        expect(socketOnText).toEqual(socketEvent.endQuestion);
        socketOnFunc();
        const [sendText, sendObject, sendCallback] = sendSpy.calls.allArgs()[0];
        expect(sendText).toEqual(socketEvent.getScore);
        expect(sendObject).toEqual({ roomId: 1, username: 'test' });
        sendCallback(mockScore);
        expect(component.playerScore).toEqual(mockScore.points);
        expect(component.isBonus).toEqual(mockScore.isBonus);
    });

    it('should configure base socket features for time transition correctly', () => {
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[1];
        expect(socketOnText).toEqual(socketEvent.timeTransition);
        socketOnFunc(mockTimeValue);
        expect(component.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(component.gameService.lockedStatus).toEqual(false);
        expect(component.gameService.validatedStatus).toEqual(false);
        expect(component.isBonus).toEqual(false);
    });

    it('should configure base socket features for final time transition correctly', () => {
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[2];
        expect(socketOnText).toEqual(socketEvent.finalTimeTransition);
        socketOnFunc(mockTimeValue);
        expect(component.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(component.isGameOver).toEqual(true);
    });

    it('should configure base socket features for removed from game correctly', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[3];
        expect(socketOnText).toEqual(socketEvent.removedFromGame);
        socketOnFunc();
        expect(routerSpy).toHaveBeenCalledWith(['/']);
    });

    it('should create in test mode if active route is quiz-testing-page', () => {
        component['route'].snapshot.url[0].path = 'quiz-testing-page';
        fixture = TestBed.createComponent(GameInterfaceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should get correct player score', () => {
        component.gameService.isTestMode = false;
        expect(component.score).toEqual(0);
    });

    it('should get correct player score', () => {
        component.gameService.isTestMode = true;
        spyOnProperty(component.gameService, 'playerScore', 'get').and.returnValue(1);
        expect(component.score).toEqual(component.playerScore);
    });

    it('should get correct player bonus', () => {
        component.gameService.isTestMode = false;
        expect(component.bonusStatus).toBeFalsy();
    });

    it('should get correct bonus player score', () => {
        component.gameService.isTestMode = true;
        spyOnProperty(component.gameService, 'isBonus', 'get').and.returnValue(true);
        expect(component.bonusStatus).toBeTruthy();
    });

    it('should get and define properly the players data', () => {
        const mockPlayers = ['un'];
        component.playerListComponent.getPlayersList();
        const [sendGatherPlayers, sendGatherObject, sendGatherCallback] = sendSpy.calls.allArgs()[0];
        expect(sendGatherObject).toEqual(component.gameService.gameRealService.roomId);
        expect(sendGatherCallback).toBeDefined();
        expect(sendGatherPlayers).toEqual(socketEvent.gatherPlayersUsername);
        sendGatherCallback(mockPlayers);
        const [sendGetScore, sendGetScoreObject, sendGetScoreCallback] = sendSpy.calls.allArgs()[1];
        expect(sendGetScore).toEqual(socketEvent.getScore);
        expect(sendGetScoreObject).toBeDefined();
        expect(sendGetScoreCallback).toBeDefined();
        sendGetScoreCallback(mockScore);
    });
});
