import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { Score } from '@common/interfaces/score.interface';
import { GameInterfaceComponent } from './game-interface.component';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { By } from '@angular/platform-browser';

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
        component.isGameOver = true;
        fixture.detectChanges();
        const childComponent = fixture.debugElement.query(By.directive(PlayerListComponent)).componentInstance;
        spyOn(childComponent, 'getPlayersList');
        component.isGameOver = false;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should configure base socket features for end question correctly', () => {
        component.gameService.gameRealService.username = 'test';
        spyOnProperty(component.gameService, 'username', 'get').and.returnValue('test');
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
        expect(component.gameService.lockedStatus).toEqual(false);
        expect(component.gameService.validatedStatus).toEqual(false);
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
});
