import { GameService } from '@app/services/game.service';
import { TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service';
import { QuestionType } from '@common/interfaces/quiz.interface';

const TIMER_VALUE = 20;
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('GameService', () => {
    let service: GameService;
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
        service = TestBed.inject(GameService);
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should configure base sockets properly', () => {
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const handleTimeSpy = spyOn<any>(service, 'handleTimeEvent');
        service['configureBaseSockets']();
        const [[firstEvent, firstAction], [secondEvent, secondAction], [thirdEvent, thirdAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('get initial question');
        expect(secondEvent).toEqual('get next question');
        expect(thirdEvent).toEqual('time');

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
        expect(service.players.size).toEqual(0);
        expect(service.answers.size).toEqual(0);
        expect(service.questionNumber).toEqual(1);
    });

    it('should destroy the component correctly', () => {
        const resetSpy = spyOn<any>(service, 'reset');
        const offAnySpy = spyOn<any>(socketService.socket, 'offAny');
        service.destroy();
        expect(resetSpy).toHaveBeenCalled();
        expect(offAnySpy).toHaveBeenCalled();
    });

    it('shoud initialize component properly when calling init method', () => {
        const configureBaseSocketsSpy = spyOn<any>(service, 'configureBaseSockets');
        const sendSpy = spyOn(service.socketService, 'send');
        service.roomId = 1;
        service.init();
        expect(configureBaseSocketsSpy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith('get question', 1);
    });

    it('should remove choice if already selected', () => {
        service.locked = false;
        service.answers = new Map();
        service.answers.set(1, 'test');
        service.selectChoice(1);
        expect(service.answers.size).toEqual(0);
    });

    it('should add choice if not already selected', () => {
        service.locked = false;
        service.question = questionMock;
        service.question.choices = [{ text: 'test', isCorrect: true }];
        service.answers = new Map();
        service.selectChoice(0);
        expect(service.answers.size).toEqual(1);
        expect(service.answers.get(0)).toEqual('test');
        service.question.choices = undefined;
        service.selectChoice(1);
        expect(service.answers.size).toEqual(2);
        expect(service.answers.get(1)).toEqual(null);
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
        expect(sendSpy).toHaveBeenCalledWith('submit answer', expectedObject);
        expect(service.answers.size).toEqual(0);
    });
});
