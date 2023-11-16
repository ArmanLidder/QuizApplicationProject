import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { HostInterfaceComponent } from './host-interface.component';
import { GameService } from '@app/services/game.service/game.service';
import { OrganizerHistogramComponent } from '@app/components/organizer-histogram/organizer-histogram.component';
import { NgChartsModule } from 'ng2-charts';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { HttpClientModule } from '@angular/common/http';
import { QuestionType } from '@common/enums/question-type.enum';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { By } from '@angular/platform-browser';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { playerStatus } from '@common/player-status/player-status';

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
            declarations: [HostInterfaceComponent, OrganizerHistogramComponent, PlayerListComponent],
            providers: [
                SocketClientService,
                GameService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
            imports: [NgChartsModule, HttpClientModule],
        }).compileComponents();
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture = TestBed.createComponent(HostInterfaceComponent);
        TestBed.inject(GameService);
        activatedRoute = TestBed.inject(ActivatedRoute);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        const childComponent = fixture.debugElement.query(By.directive(PlayerListComponent)).componentInstance;

        component = fixture.componentInstance;
        spyOn(childComponent, 'getPlayersList');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return false when a player is not in the list', () => {
        expect(component.playerHasLeft('Alice')).toBeFalsy();
    });

    it('should return false when a player is in the list', () => {
        component.leftPlayers = [['player1', 0, 0, playerStatus.left]];
        expect(component.playerHasLeft('player1')).toBeTruthy();
    });

    it('should configure sockets if socket is alive', () => {
        const initSpy = spyOn(component.gameService, 'init');
        fixture = TestBed.createComponent(HostInterfaceComponent);
        component = fixture.componentInstance;
        spyOn(activatedRoute.snapshot.paramMap, 'get');
        expect(initSpy).toHaveBeenCalled();
    });

    it('should configure the right socket event listener', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
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
            [seventhEvent, seventhAction],
            [eighthEvent, eightAction],
        ] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.timeTransition);
        expect(secondEvent).toEqual(socketEvent.endQuestion);
        expect(thirdEvent).toEqual(socketEvent.finalTimeTransition);
        expect(fourthEvent).toEqual(socketEvent.refreshChoicesStats);
        expect(fifthEvent).toEqual(socketEvent.getInitialQuestion);
        expect(sixthEvent).toEqual(socketEvent.getNextQuestion);
        expect(seventhEvent).toEqual(socketEvent.removedPlayer);
        expect(eighthEvent).toEqual(socketEvent.endQuestionAfterRemoval);

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
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
        if (typeof seventhAction === 'function') {
            // component.playerListComponent.players = [
            //     ['player1', 1, 0],
            //     ['player2', 1, 0],
            //     ['player3', 1, 0],
            // ];
            // seventhAction('player2');
            // expect(component.leftPlayers).toEqual([['player2', 1, 0]]);
        }
        if (typeof eightAction === 'function') {
            eightAction(TIMER_VALUE);
            expect(component.gameService.gameRealService.validated).toBeTruthy();
            expect(component.gameService.gameRealService.locked).toBeTruthy();
        }
    });

    it('should go to next question when timer is 0', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.timeTransition);

        if (typeof firstAction === 'function') {
            firstAction(0);
            expect(sendSpy).toHaveBeenCalledWith(socketEvent.nextQuestion, component.gameService.gameRealService.roomId);
            expect(component.gameService.timer).toEqual(0);
            expect(component.gameService.questionNumber).toEqual(1);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
            expect(component.timerText).toEqual('Temps restant ');
        }
    });

    it('should go to the final result when timer is 0', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction], [thirdEvent, thirdAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.timeTransition);
        expect(secondEvent).toEqual(socketEvent.endQuestion);
        expect(thirdEvent).toEqual(socketEvent.finalTimeTransition);

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
        }
        if (typeof thirdAction === 'function') {
            thirdAction(0);
            expect(component.timerText).toEqual('Résultat disponible dans ');
            expect(component.isGameOver).toEqual(true);
        }
    });

    it('should go to the next question', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['nextQuestion']();
        expect(component.gameService.validatedStatus).toEqual(false);
        expect(component.gameService.lockedStatus).toEqual(false);
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.startTransition, component.gameService.gameRealService.roomId);
    });

    it('should handle properly the last question', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['handleLastQuestion']();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.showResult, component.gameService.gameRealService.roomId);
    });

    it('should update host command properly', () => {
        component.gameService.gameRealService.isLast = false;
        expect(component.updateHostCommand()).toEqual('Prochaine question');
        component.gameService.gameRealService.isLast = true;
        expect(component.updateHostCommand()).toEqual('Montrer résultat');
    });

    it('should handle properly the host command', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['gameService'].gameRealService.isLast = false;
        component.handleHostCommand();
        expect(component.gameService.validatedStatus).toEqual(false);
        expect(component.gameService.lockedStatus).toEqual(false);
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.startTransition, component.gameService.gameRealService.roomId);
        component['gameService'].gameRealService.isLast = true;
        component.handleHostCommand();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.showResult, component.gameService.gameRealService.roomId);
    });

    it('should return the right condition of isDisabled', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const functionReturn = component.isDisabled();
        expect(functionReturn).toEqual(!component['gameService'].lockedStatus && !component['gameService'].validatedStatus);
    });

    it('should initialize correctly histogram data when initGraph is called', () => {
        const expectedMapChanginResponses = new Map();
        component['initGraph'](mockQuestion);
        expect(component.histogramDataValue).toEqual(mockValuesMap);
        expect(component.histogramDataChangingResponses).toEqual(expectedMapChanginResponses);
    });

    it('should return the right condition of updateHostCommand', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const functionReturn = component.updateHostCommand();
        expect(functionReturn).toEqual(component['gameService'].gameRealService.isLast ? 'Montrer résultat' : 'Prochaine question');
    });
});
