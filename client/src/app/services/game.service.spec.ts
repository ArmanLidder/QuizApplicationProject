import { GameService } from '@app/services/game.service';
import { TestBed } from '@angular/core/testing';
import { QuestionType } from '@common/enums/question-type.enum';
import { GameTestService } from '@app/services/game-test.service';
import { GameRealService } from '@app/services/game-real.service';
import { TimeService } from '@app/services/time.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('GameService', () => {
    const timeService: TimeService = new TimeService();
    let service: GameService;

    const firstQuestionMock = {
        type: QuestionType.QCM,
        text: 'What is 2 + 2?',
        points: 50,
        choices: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
        ],
    };

    const secondQuestionMock = {
        type: QuestionType.QCM,
        text: 'What is 3 + 2?',
        points: 30,
        choices: [
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameTestService, GameRealService],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should provide the correct timer based on isTestMode', () => {
        service.isTestMode = true;
        service.gameTestService.timer = timeService.createTimer(1);
        service.gameRealService.timer = 4;

        expect(service.timer).toBe(service.gameTestService.timer.time);

        service.isTestMode = false;
        expect(service.timer).toBe(service.gameRealService.timer);
    });

    it('should provide the correct player score', () => {
        service.isTestMode = true;
        service.gameTestService.playerScore = 100;
        expect(service.playerScore).toBe(service.gameTestService.playerScore);
    });

    it('should provide the correct isBonus status', () => {
        service.isTestMode = true;
        service.gameTestService.isBonus = true;
        expect(service.isBonus).toBe(service.gameTestService.isBonus);
    });

    it('should provide the correct question based on isTestMode', () => {
        service.isTestMode = true;
        service.gameTestService.question = firstQuestionMock;
        service.gameRealService.question = secondQuestionMock;

        expect(service.question).toBe(firstQuestionMock);

        service.isTestMode = false;
        expect(service.question).toBe(secondQuestionMock);
    });

    it('should provide the correct question number based on isTestMode', () => {
        service.isTestMode = true;
        service.gameTestService.currQuestionIndex = 2;
        service.gameRealService.questionNumber = 1;

        expect(service.questionNumber).toBe(3);

        service.isTestMode = false;
        expect(service.questionNumber).toBe(1);
    });

    it('should provide the correct username', () => {
        const testUsername = 'TestUser';
        service.gameRealService.username = testUsername;

        expect(service.username).toBe(testUsername);
    });

    it('should return the correct locked status based on isTestMode', () => {
        service.isTestMode = true;
        service.gameTestService.locked = true;
        service.gameRealService.locked = false;

        expect(service.lockedStatus).toBe(true);

        service.isTestMode = false;
        expect(service.lockedStatus).toBe(false);
    });

    it('should return the correct validated status based on isTestMode', () => {
        service.isTestMode = true;
        service.gameTestService.validated = true;
        service.gameRealService.validated = false;

        expect(service.validatedStatus).toBe(true);

        service.isTestMode = false;
        expect(service.validatedStatus).toBe(false);
    });

    it('should call reset when destroy is invoked', () => {
        spyOn<any>(service, 'reset');
        service.destroy();
        expect(service['reset']).toHaveBeenCalled();
    });

    it('should initialize the services based on isTestMode in init', () => {
        service.isTestMode = true;
        const quizId = 'testQuizId';
        spyOn(service.gameTestService, 'init');
        service.init(quizId);
        expect(service.gameTestService.init).toHaveBeenCalled();
        expect(service.gameTestService.quizId).toBe(quizId);
        service.isTestMode = false;
        spyOn(service.gameRealService, 'init');
        const roomId = '123';
        service.init(roomId);
        expect(service.gameRealService.init).toHaveBeenCalled();
        expect(service.gameRealService.roomId).toBe(Number(roomId));
    });

    it('should send answers and clear them in sendAnswer', () => {
        service.isTestMode = true;
        const testAnswers = new Map<number, string | null>();
        testAnswers.set(0, 'Answer1');
        testAnswers.set(1, 'Answer2');
        service.answers = testAnswers;
        spyOn(service.gameTestService, 'sendAnswer');
        service.sendAnswer();
        expect(service.gameTestService.sendAnswer).toHaveBeenCalled();
        expect(service.answers.size).toBe(0);
        service.isTestMode = false;
        spyOn(service.gameRealService, 'sendAnswer');
        service.sendAnswer();
        expect(service.gameRealService.sendAnswer).toHaveBeenCalled();
        expect(service.answers.size).toBe(0);
    });

    it('should reset services in reset method', () => {
        spyOn(service.gameRealService, 'destroy');
        spyOn(service.gameTestService, 'reset');
        service['reset']();
        expect(service.gameRealService.destroy).toHaveBeenCalled();
        expect(service.gameTestService.reset).toHaveBeenCalled();
    });

    it('should select and send the choice to gameRealService when not locked', () => {
        service.isTestMode = false;
        service.gameRealService.locked = false;
        const testIndex = 0;
        const testTextChoice = '3';
        service.gameRealService.question = firstQuestionMock;
        service.answers = new Map<number, string | null>();
        spyOn(service.gameRealService, 'sendSelection');

        service.selectChoice(testIndex);

        expect(service.gameRealService.sendSelection).toHaveBeenCalledWith(testIndex, true);
        expect(service.answers.get(testIndex)).toBe(testTextChoice);

        service.selectChoice(testIndex);

        expect(service.gameRealService.sendSelection).toHaveBeenCalledWith(testIndex, false);
        expect(service.answers.get(testIndex)).toBeUndefined();
    });

    it('should not select and send the choice to gameRealService when locked', () => {
        service.isTestMode = false;
        service.gameRealService.locked = true;
        const testIndex = 1;
        service.answers = new Map<number, string | null>();
        spyOn(service.gameRealService, 'sendSelection');
        service.selectChoice(testIndex);
        expect(service.gameRealService.sendSelection).not.toHaveBeenCalled();
        expect(service.answers.size).toBe(0);

        service.gameRealService.locked = false;
        service.answers = new Map<number, string | null>();
        service.gameRealService.question = null;
        service.selectChoice(testIndex);
        expect(service.answers.get(testIndex)).toBeNull();
    });
});
