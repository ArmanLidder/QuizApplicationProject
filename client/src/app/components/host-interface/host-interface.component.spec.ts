import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';
import { HostInterfaceComponent } from './host-interface.component';

const DIGIT_CONSTANT = 1;

describe('HostInterfaceComponent', () => {
    let component: HostInterfaceComponent;
    let fixture: ComponentFixture<HostInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostInterfaceComponent],
            providers: [
                SocketClientService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ]
        });
        fixture = TestBed.createComponent(HostInterfaceComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should configure the right socket event listener', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('time transition');
        expect(secondEvent).toEqual('final time transition');

        if (typeof firstAction === 'function') {
            firstAction(20);
            expect(component.gameService.timer).toEqual(20);
        }
        if (typeof secondAction === 'function') {
            secondAction(20);
            expect(component.timerText).toEqual("Les résultats finaux s'afficherons dans:");
            expect(component.gameService.timer).toEqual(20);
        }
    });

    it('should go to next question when timer is 0', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('time transition');

        if (typeof firstAction === 'function') {
            firstAction(0);
            expect(sendSpy).toHaveBeenCalledWith('next question', component.gameService.roomId);
            expect(component.gameService.currentQuestionIndex).toEqual(1);
            expect(component.timerText).toEqual('Temps restant');
        }
    });

    it('should go to the final result when timer is 0', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('time transition');
        expect(secondEvent).toEqual('final time transition');

        if (typeof firstAction === 'function') {
            firstAction(20);
            expect(component.gameService.timer).toEqual(20);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.timerText).toEqual("Les résultats finaux s'afficherons dans:");
            expect(component.isGameOver).toEqual(true);
        }
    });

    it('should go to the next question', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['nextQuestion']();
        expect(component.gameService.validated).toEqual(false);
        expect(component.gameService.locked).toEqual(false);
        expect(sendSpy).toHaveBeenCalledWith('start transition', component.gameService.roomId);
    });
});
