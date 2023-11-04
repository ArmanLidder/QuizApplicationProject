import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { HostInterfaceComponent } from './host-interface.component';
import { GameService } from '@app/services/game.service/game.service';
import { OrganizerHistogramComponent } from '@app/components/organizer-histogram/organizer-histogram.component';
import { NgChartsModule } from 'ng2-charts';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';

const DIGIT_CONSTANT = 1;
const TIMER_VALUE = 20;

describe('HostInterfaceComponent', () => {
    let component: HostInterfaceComponent;
    let fixture: ComponentFixture<HostInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    let mockQuestion: QuizQuestion;
    let mockValuesMap: Map<string, boolean>;
    let activatedRoute: ActivatedRoute;

    beforeEach(() => {
        mockQuestion = {
            type: QuestionType.QCM,
            text: 'What is the capital of France?',
            points: 10,
            choices: [
                { text: 'Paris', isCorrect: true },
                { text: 'Berlin', isCorrect: false },
                { text: 'Madrid', isCorrect: false },
            ],
        };

        mockValuesMap = new Map([
            ['Paris', true],
            ['Berlin', false],
            ['Madrid', false],
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostInterfaceComponent, OrganizerHistogramComponent],
            providers: [
                SocketClientService,
                GameService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
            imports: [NgChartsModule],
        }).compileComponents();
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(HostInterfaceComponent);
        TestBed.inject(GameService);
        activatedRoute = TestBed.inject(ActivatedRoute);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should configure sockets if socket is alive', () => {
        const initSpy = spyOn(component.gameService, 'init');
        fixture = TestBed.createComponent(HostInterfaceComponent);
        component = fixture.componentInstance;
        spyOn(activatedRoute.snapshot.paramMap, 'get');
        expect(initSpy).toHaveBeenCalled();
    });

    it('should configure the right socket event listener', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        spyOn<any>(component, 'initGraph');
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        component['configureBaseSocketFeatures']();
        const [
            [firstEvent, firstAction],
            [secondEvent, secondAction],
            [thirdEvent, thirdAction],
            [fourthEvent, fourthAction],
            [fifthEvent, fifthAction],
            [sixthEvent, sixthAction],
        ] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('time transition');
        expect(secondEvent).toEqual('end question');
        expect(thirdEvent).toEqual('final time transition');
        expect(fourthEvent).toEqual('refresh choices stats');
        expect(fifthEvent).toEqual('get initial question');
        expect(sixthEvent).toEqual('get next question');

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }
        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validated).toEqual(true);
            expect(component.gameService.locked).toEqual(true);
        }

        if (typeof thirdAction === 'function') {
            thirdAction(TIMER_VALUE);
            expect(component.timerText).toEqual('Résultat disponible dans ');
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }
        if (typeof fourthAction === 'function') {
            fourthAction([0]);
            expect(component.histogramDataChangingResponses).toBeDefined();
        }
        if (typeof fifthAction === 'function') {
            fifthAction(0);
            expect(component.histogramDataChangingResponses).toBeDefined();
        }
        if (typeof sixthAction === 'function') {
            sixthAction({ question: {}, index: 0, isLast: false });
            expect(component['initGraph']).toHaveBeenCalled();
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
            expect(component.gameService.timer).toEqual(0);
            expect(component.gameService.questionNumber).toEqual(1);
            expect(component.gameService.validated).toEqual(true);
            expect(component.gameService.locked).toEqual(true);
            expect(component.timerText).toEqual('Temps restant');
        }
    });

    it('should go to the final result when timer is 0', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction], [thirdEvent, thirdAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('time transition');
        expect(secondEvent).toEqual('end question');
        expect(thirdEvent).toEqual('final time transition');

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validated).toEqual(true);
            expect(component.gameService.locked).toEqual(true);
        }
        if (typeof thirdAction === 'function') {
            thirdAction(0);
            expect(component.timerText).toEqual('Résultat disponible dans ');
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

    it('should handle properly the last question', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['handleLastQuestion']();
        expect(sendSpy).toHaveBeenCalledWith('show result', component.gameService.roomId);
    });

    it('should update host command properly', () => {
        component.gameService.isLast = false;
        expect(component.updateHostCommand()).toEqual('Prochaine question');
        component.gameService.isLast = true;
        expect(component.updateHostCommand()).toEqual('Montrer résultat');
    });

    it('should handle properly the host command', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['gameService'].isLast = false;
        component.handleHostCommand();
        expect(component.gameService.validated).toEqual(false);
        expect(component.gameService.locked).toEqual(false);
        expect(sendSpy).toHaveBeenCalledWith('start transition', component.gameService.roomId);
        component['gameService'].isLast = true;
        component.handleHostCommand();
        expect(sendSpy).toHaveBeenCalledWith('show result', component.gameService.roomId);
    });

    it('should return the right condition of isDisabled', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const functionReturn = component.isDisabled();
        expect(functionReturn).toEqual(!component['gameService'].locked && !component['gameService'].validated);
    });

    it('should initialize correctly histogram data when initGraph is called', () => {
        const expectedMapChanginResponses = new Map();
        component['initGraph'](mockQuestion);
        expect(component.histogramDataValue).toEqual(mockValuesMap);
        expect(component.histogramDataChangingResponses).toEqual(expectedMapChanginResponses);
    });

    it('should return the right condition of updateHostCommand', () => {
        component['gameService'].roomId = DIGIT_CONSTANT;
        const functionReturn = component.updateHostCommand();
        expect(functionReturn).toEqual(component['gameService'].isLast ? 'Montrer résultat' : 'Prochaine question');
    });
});
