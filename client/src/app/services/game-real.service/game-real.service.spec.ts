import { TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameRealService } from '@app/services/game-real.service/game-real.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionType } from '@common/enums/question-type.enum';

const TIMER_VALUE = 20;
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('GameRealService', () => {
    let service: GameRealService;
    let socketService: SocketClientServiceTestHelper;
    const questionMock = {
        type: QuestionType.QCM,
        text: 'What is 2 + 2?',
        points: 50,
        choices: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        service = TestBed.inject(GameRealService);
    });

    it('should create', () => {
        spyOn(service, 'configureBaseSockets');
        expect(service).toBeTruthy();
    });

    it('should configure base sockets properly', () => {
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const handleTimeSpy = spyOn<any>(service, 'handleTimeEvent');
        service['configureBaseSockets']();
        const [[firstEvent, firstAction], [secondEvent, secondAction], [thirdEvent, thirdAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual(socketEvent.getInitialQuestion);
        expect(secondEvent).toEqual(socketEvent.getNextQuestion);
        expect(thirdEvent).toEqual(socketEvent.time);

        if (typeof firstAction === 'function') {
            firstAction({ question: questionMock, username: 'Arman', index: 1, numberOfQuestions: 1 });
            expect(service.question).toEqual(questionMock);
            expect(service.username).toEqual('Arman');
        }
        if (typeof secondAction === 'function') {
            secondAction({ question: questionMock, username: 'Arman', isLast: true });
            expect(service.question).toEqual(questionMock);
            expect(service.username).toEqual('Arman');
            expect(service.isLast).toEqual(true);
            expect(service.validated).toEqual(false);
            expect(service.locked).toEqual(false);
        }
        if (typeof thirdAction === 'function') {
            thirdAction(TIMER_VALUE);
            expect(handleTimeSpy).toHaveBeenCalled();
        }
    });

    it('should handle time event properly', () => {
        const sendAnswerSpy = spyOn<any>(service, 'sendAnswer');
        service.locked = false;
        service.username = 'Joueur';
        service['handleTimeEvent'](0);
        expect(service.timer).toEqual(0);
        expect(service.locked).toBeTruthy();
        expect(sendAnswerSpy).toHaveBeenCalled();
    });

    it('should reset properly', () => {
        service['reset']();
        expect(service.username).toEqual('');
        expect(service.timer).toEqual(0);
        expect(service.roomId).toEqual(0);
        expect(service.question).toEqual(null);
        expect(service.locked).toEqual(false);
        expect(service.validated).toEqual(false);
        expect(service.isLast).toEqual(false);
        expect(service.players.length).toEqual(0);
        expect(service.answers.size).toEqual(0);
        expect(service.questionNumber).toEqual(1);
    });

    it('should destroy the component correctly', () => {
        const resetSpy = spyOn<any>(service, 'reset');
        const removeAllListenersSpy = spyOn<any>(socketService.socket, 'removeAllListeners');
        service.destroy();
        expect(resetSpy).toHaveBeenCalled();
        expect(removeAllListenersSpy).toHaveBeenCalled();
    });

    it('shouLd initialize component properly when calling init method', () => {
        const configureBaseSocketsSpy = spyOn<any>(service, 'configureBaseSockets');
        const sendSpy = spyOn(service.socketService, 'send');
        service.roomId = 1;
        service.init();
        expect(configureBaseSocketsSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.getQuestion, 1);
    });

    it('should send answer', () => {
        service.roomId = 1;
        service.timer = 0;
        service.username = 'test';
        service.locked = false;
        service.question = questionMock;
        service.answers = new Map();
        service.answers.set(1, 'test');
        const sendSpy = spyOn(service.socketService, 'send');
        const expectedObject = {
            roomId: 1,
            answers: ['test'],
            timer: 0,
            username: 'test',
        };
        service.sendAnswer();
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.submitAnswer, expectedObject);
        expect(service.answers.size).toEqual(0);
    });

    it('should send the selection properly', () => {
        const index = 0;
        const isSelected = true;
        const sendSpy = spyOn(service.socketService, 'send');
        service['sendSelection'](0, isSelected);
        expect(sendSpy).toHaveBeenCalledWith(socketEvent.updateSelection, { roomId: service.roomId, isSelected, index });
    });
});