import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { GameInterfaceComponent } from './game-interface.component';

describe('GameInterfaceComponent', () => {
    let component: GameInterfaceComponent;
    let fixture: ComponentFixture<GameInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    // let gameServiceSpy : SpyObj<GameService>;
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
            declarations: [GameInterfaceComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
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
        component.gameService.username = 'test';
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[0];
        expect(socketOnText).toEqual('end question');
        socketOnFunc();
        const [sendText, sendObject, sendCallback] = sendSpy.calls.allArgs()[0];
        expect(sendText).toEqual('get score');
        expect(sendObject).toEqual({ roomId: 1, username: 'test' });
        sendCallback(mockScore);
        expect(component.playerScore).toEqual(mockScore.points);
        expect(component.isBonus).toEqual(mockScore.isBonus);
    });

    it('should configure base socket features for time transition correctly', () => {
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[1];
        expect(socketOnText).toEqual('time transition');
        socketOnFunc(mockTimeValue);
        expect(component.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(component.gameService.locked).toEqual(false);
        expect(component.gameService.validated).toEqual(false);
        expect(component.isBonus).toEqual(false);
    });

    it('should configure base socket features for final time transition correctly', () => {
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[2];
        expect(socketOnText).toEqual('final time transition');
        socketOnFunc(mockTimeValue);
        expect(component.gameService.timer).toEqual(mockTimeValue);
        socketOnFunc(0);
        expect(component.isGameOver).toEqual(true);
    });

    it('should configure base socket features for removed from game correctly', () => {
        const routerSpy = spyOn(component['router'], 'navigate');
        component['configureBaseSocketFeatures']();
        const [socketOnText, socketOnFunc] = onSpy.calls.allArgs()[3];
        expect(socketOnText).toEqual('removed from game');
        socketOnFunc();
        expect(routerSpy).toHaveBeenCalledWith(['/']);
    });

    it('should get and define properly the players data', () => {
        const mockPlayers = ['un'];
        component.playersData();
        const [sendGatherPlayers, sendGatherObject, sendGatherCallback] = sendSpy.calls.allArgs()[0];
        expect(sendGatherPlayers).toEqual('gather players username');
        expect(sendGatherObject).toEqual(component.gameService.roomId);
        expect(sendGatherCallback).toBeDefined();
        sendGatherCallback(mockPlayers);
        const [sendGetScore, sendGetScoreObject, sendGetScoreCallback] = sendSpy.calls.allArgs()[1];
        expect(sendGetScore).toEqual('get score');
        expect(sendGetScoreObject).toBeDefined();
        expect(sendGetScoreCallback).toBeDefined();
        sendGetScoreCallback(mockScore);
    });
});
