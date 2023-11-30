/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { CorrectionQRLComponent } from '@app/components/correction-qrl/correction-qrl.component';
import { OrganizerHistogramComponent } from '@app/components/organizer-histogram/organizer-histogram.component';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { StatisticZoneComponent } from '@app/components/statistic-zone/statistic-zone.component';
import { question } from '@app/components/statistic-zone/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { QuestionType } from '@common/enums/question-type.enum';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { playerStatus } from '@common/player-status/player-status';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { NgChartsModule } from 'ng2-charts';
import { HostInterfaceComponent } from './host-interface.component';

const DIGIT_CONSTANT = 1;
const TIMER_VALUE = 20;

describe('HostInterfaceComponent', () => {
    let component: HostInterfaceComponent;
    let fixture: ComponentFixture<HostInterfaceComponent>;
    let socketService: SocketClientServiceTestHelper;
    let mockQuestion: QuizQuestion;
    let mockQuestionQRL: QuizQuestion;
    let mockValuesMap: Map<string, boolean>;
    let activatedRoute: ActivatedRoute;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let getPlayerListSpy: jasmine.Spy<any>;

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

        mockQuestionQRL = {
            type: QuestionType.QLR,
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
            declarations: [HostInterfaceComponent, OrganizerHistogramComponent, PlayerListComponent, CorrectionQRLComponent, StatisticZoneComponent],
            providers: [
                SocketClientService,
                GameService,
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
            ],
            imports: [NgChartsModule, HttpClientModule, MatTooltipModule],
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
        getPlayerListSpy = spyOn(childComponent, 'getPlayersList').and.resolveTo(Promise.resolve(1));
        component.gameService.gameRealService.question = mockQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return false when a player is not in the list', () => {
        expect(component.playerHasLeft('Alice')).toBeFalsy();
    });

    it('should return false when a player is in the list', () => {
        component.leftPlayers = [['player1', 0, 0, playerStatus.left, true]];
        expect(component.playerHasLeft('player1')).toBeTruthy();
    });

    it('should configure sockets if socket is alive', () => {
        const initSpy = spyOn(component.gameService, 'init');
        fixture = TestBed.createComponent(HostInterfaceComponent);
        component = fixture.componentInstance;
        spyOn(activatedRoute.snapshot.paramMap, 'get');
        expect(initSpy).toHaveBeenCalled();
    });

    it('should configure the right socket event listener', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'initGraph' as any);
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
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
            [nineEvent, nineAction],
            [tenthEvent, tenthAction],
        ] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.TIME_TRANSITION);
        expect(secondEvent).toEqual(socketEvent.END_QUESTION);
        expect(thirdEvent).toEqual(socketEvent.FINAL_TIME_TRANSITION);
        expect(fourthEvent).toEqual(socketEvent.REFRESH_CHOICES_STATS);
        expect(fifthEvent).toEqual(socketEvent.GET_INITIAL_QUESTION);
        expect(sixthEvent).toEqual(socketEvent.GET_NEXT_QUESTION);
        expect(seventhEvent).toEqual(socketEvent.REMOVED_PLAYER);
        expect(eighthEvent).toEqual(socketEvent.END_QUESTION_AFTER_REMOVAL);
        expect(nineEvent).toEqual(socketEvent.EVALUATION_OVER);
        expect(tenthEvent).toEqual(socketEvent.REFRESH_ACTIVITY_STATS);

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
            component.gameService.gameRealService.question = mockQuestion;
            component.gameService.gameRealService.question.type = QuestionType.QLR;
            component.gameService.gameRealService.roomId = 0;
            const sendSpy = spyOn(component['socketService'], 'send').and.callThrough();
            secondAction(0);
            const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
            expect(event).toEqual(socketEvent.GET_PLAYER_ANSWERS);
            expect(roomId).toEqual(0);
            if (typeof callback === 'function') {
                const testMap = new Map([['test', { answers: 'test', time: 0 }]]);
                component.isHostEvaluating = false;
                callback(JSON.stringify(Array.from(testMap)));
                expect(sendSpy).toHaveBeenCalled();
                expect(component.isHostEvaluating).toBeTruthy();
            }
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
        }
        if (typeof seventhAction === 'function') {
            component.playerListComponent.players = [
                ['player1', 1, 0, playerStatus.validation, true],
                ['player2', 1, 0, playerStatus.validation, true],
                ['player3', 1, 0, playerStatus.validation, true],
            ];
            seventhAction('player2');
            expect(component.leftPlayers).toEqual([['player2', 1, 0, playerStatus.validation, true]]);
        }
        if (typeof eightAction === 'function') {
            eightAction(TIMER_VALUE);
            expect(component.gameService.gameRealService.validated).toBeTruthy();
            expect(component.gameService.gameRealService.locked).toBeTruthy();
        }
        if (typeof eightAction === 'function') {
            nineAction(0);
            expect(getPlayerListSpy).toHaveBeenCalled();
        }
        if (typeof tenthAction === 'function') {
            tenthAction([0, 0]);
            expect(component.histogramDataChangingResponses).toEqual(
                new Map([
                    ['Actif', 0],
                    ['Inactif', 0],
                ]),
            );
        }
    }));

    it('should go to next question when timer is 0', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'initGraph' as any);
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.TIME_TRANSITION);

        if (typeof firstAction === 'function') {
            firstAction(0);
            expect(sendSpy).toHaveBeenCalledWith(socketEvent.NEXT_QUESTION, component.gameService.gameRealService.roomId);
            expect(component.gameService.timer).toEqual(0);
            expect(component.gameService.questionNumber).toEqual(1);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
            expect(component.timerText).toEqual('Temps restant ');
        }
    });

    it('should configure the right socket event listener', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'initGraph' as any);
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
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
            [nineEvent, nineAction],
            [tenthEvent, tenthAction],
        ] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.TIME_TRANSITION);
        expect(secondEvent).toEqual(socketEvent.END_QUESTION);
        expect(thirdEvent).toEqual(socketEvent.FINAL_TIME_TRANSITION);
        expect(fourthEvent).toEqual(socketEvent.REFRESH_CHOICES_STATS);
        expect(fifthEvent).toEqual(socketEvent.GET_INITIAL_QUESTION);
        expect(sixthEvent).toEqual(socketEvent.GET_NEXT_QUESTION);
        expect(seventhEvent).toEqual(socketEvent.REMOVED_PLAYER);
        expect(eighthEvent).toEqual(socketEvent.END_QUESTION_AFTER_REMOVAL);
        expect(nineEvent).toEqual(socketEvent.EVALUATION_OVER);
        expect(tenthEvent).toEqual(socketEvent.REFRESH_ACTIVITY_STATS);

        if (typeof firstAction === 'function') {
            firstAction(TIMER_VALUE);
            expect(component.gameService.timer).toEqual(TIMER_VALUE);
        }

        if (typeof secondAction === 'function') {
            secondAction(0);
            expect(component.gameService.validatedStatus).toEqual(true);
            expect(component.gameService.lockedStatus).toEqual(true);
            component.gameService.gameRealService.question = mockQuestion;
            component.gameService.gameRealService.question.type = QuestionType.QLR;
            component.gameService.gameRealService.roomId = 0;
            const sendSpy = spyOn(component['socketService'], 'send').and.callThrough();
            secondAction(0);
            const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
            expect(event).toEqual(socketEvent.GET_PLAYER_ANSWERS);
            expect(roomId).toEqual(0);
            if (typeof callback === 'function') {
                const testMap = new Map([['test', { answers: 'test', time: 0 }]]);
                component.isHostEvaluating = false;
                callback(JSON.stringify(Array.from(testMap)));
                expect(sendSpy).toHaveBeenCalled();
                expect(component.isHostEvaluating).toBeTruthy();
            }
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
        }
        if (typeof seventhAction === 'function') {
            component.playerListComponent.players = [
                ['player1', 1, 0, playerStatus.validation, true],
                ['player2', 1, 0, playerStatus.validation, true],
                ['player3', 1, 0, playerStatus.validation, true],
            ];
            seventhAction('player2');
            expect(component.leftPlayers).toEqual([['player2', 1, 0, playerStatus.validation, true]]);
        }
        if (typeof eightAction === 'function') {
            eightAction(TIMER_VALUE);
            expect(component.gameService.gameRealService.validated).toBeTruthy();
            expect(component.gameService.gameRealService.locked).toBeTruthy();
        }
        if (typeof eightAction === 'function') {
            nineAction(0);
            expect(getPlayerListSpy).toHaveBeenCalled();
        }
        if (typeof tenthAction === 'function') {
            tenthAction([0, 0]);
            expect(component.histogramDataChangingResponses).toEqual(
                new Map([
                    ['Actif', 0],
                    ['Inactif', 0],
                ]),
            );
        }
    }));

    it('should sendQrlAnswer if question is Qrl', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'initGraph' as any);
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        component.gameService.gameRealService.question = mockQuestion;
        component.gameService.gameRealService.question.type = QuestionType.QLR;
        component.gameService.gameRealService.roomId = 0;
        component.isHostEvaluating = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sendQrlAnswerSpy = spyOn(component, 'sendQrlAnswer' as any);
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [firstEvent, firstAction] = onSpy.calls.allArgs()[1];
        expect(firstEvent).toEqual(socketEvent.END_QUESTION);
        if (typeof firstAction === 'function') {
            firstAction(0);
            expect(sendQrlAnswerSpy).toHaveBeenCalled();
        }
    });

    it('should go to the final result when timer is 0', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(component, 'initGraph' as any);
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        component['gameService'].gameRealService.timer = DIGIT_CONSTANT;
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction], [secondEvent, secondAction], [thirdEvent, thirdAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.TIME_TRANSITION);
        expect(secondEvent).toEqual(socketEvent.END_QUESTION);
        expect(thirdEvent).toEqual(socketEvent.FINAL_TIME_TRANSITION);

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
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.START_TRANSITION, component.gameService.gameRealService.roomId);
    });
    it('should pause the timer', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['pauseTimer']();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.PAUSE_TIMER, component.gameService.gameRealService.roomId);
    });
    it('should enable the panic mode', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        component['gameService'].gameRealService.timer = TIMER_VALUE;
        const sendSpy = spyOn(socketService, 'send');
        component['panicMode']();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.PANIC_MODE, {
            roomId: component.gameService.gameRealService.roomId,
            timer: component.gameService.gameRealService.timer,
        });
    });
    it('should handle properly the last question', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const sendSpy = spyOn(socketService, 'send');
        component['handleLastQuestion']();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.SHOW_RESULT, component.gameService.gameRealService.roomId);
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
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.START_TRANSITION, component.gameService.gameRealService.roomId);
        component['gameService'].gameRealService.isLast = true;
        component.handleHostCommand();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.SHOW_RESULT, component.gameService.gameRealService.roomId);
    });
    it('should return the right condition of isDisabled', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const functionReturn = component.isDisabled();
        expect(functionReturn).toEqual(!component['gameService'].lockedStatus && !component['gameService'].validatedStatus);
    });
    it('should initialize correctly histogram data when initGraph is called', () => {
        const expectedMapChanginResponses = new Map();
        component.gameService.gameRealService.question = mockQuestion;
        component['initGraph'](mockQuestion);
        expect(component.histogramDataValue).toEqual(mockValuesMap);
        expect(component.histogramDataChangingResponses).toEqual(expectedMapChanginResponses);
    });
    it('should return the right condition of updateHostCommand', () => {
        component['gameService'].gameRealService.roomId = DIGIT_CONSTANT;
        const functionReturn = component.updateHostCommand();
        expect(functionReturn).toEqual(component['gameService'].gameRealService.isLast ? 'Montrer résultat' : 'Prochaine question');
    });

    it('should return the right condition of updateHostCommand', () => {
        component.gameService.gameRealService.question = mockQuestion;
        component.gameService.gameRealService.question.type = QuestionType.QLR;
        component['initGraph'](mockQuestionQRL, 0);
        const mapOne = new Map([
            ['Actif', 0],
            ['Inactif', 0],
        ]);
        const mapTwo = new Map([
            ['Actif', true],
            ['Inactif', false],
        ]);
        expect(component.histogramDataChangingResponses).toEqual(mapOne);
        expect(component.histogramDataValue).toEqual(mapTwo);
    });

    it('should prepare stats transport correctly', () => {
        component.gameStats = [
            [
                new Map<string, boolean>([
                    ['value1', true],
                    ['value2', false],
                ]),
                new Map<string, number>([
                    ['response1', 0],
                    ['response2', 0],
                ]),
                question,
            ],
        ];
        const preparedStats = component['prepareStatsTransport']();
        expect(preparedStats).toEqual([
            [
                [
                    ['value1', true],
                    ['value2', false],
                ],
                [
                    ['response1', 0],
                    ['response2', 0],
                ],
                question,
            ],
        ]);
    });
    it('should map response to array correctly', () => {
        const responseMap = new Map<string, number>([
            ['response1', 0],
            ['response2', 0],
        ]);
        const responseArray = component['mapResponseToArray'](responseMap);
        expect(responseArray).toEqual([
            ['response1', 0],
            ['response2', 0],
        ]);
    });
    it('should map value to array correctly', () => {
        const valueMap = new Map<string, boolean>([
            ['value1', true],
            ['value2', false],
        ]);
        const valueArray = component['mapValueToArray'](valueMap);
        expect(valueArray).toEqual([
            ['value1', true],
            ['value2', false],
        ]);
    });
    it('should save stats correctly for other question types', () => {
        component.gameService.gameRealService.question = mockQuestion;
        component.histogramDataValue = new Map([['test', false]]);
        component.histogramDataChangingResponses = new Map([['test', 0]]);
        component['saveStats']();
        expect(component.gameStats.length).toEqual(1);
        expect(component.gameStats[0][0]).toEqual(new Map([['test', false]]));
        expect(component.gameStats[0][1]).toEqual(new Map([['test', 0]]));
    });
});
