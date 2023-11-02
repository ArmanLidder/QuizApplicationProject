import { TestBed } from '@angular/core/testing';
import { QuizService } from '@app/services/quiz.service';
import { QuestionType, Quiz } from '@common/interfaces/quiz.interface';
import { GameTestService } from './game-test.service';

describe('GameTestService', () => {
    let gameTestService: GameTestService;
    let quizService: jasmine.SpyObj<QuizService>;
    let extractCorrectChoicesSpy: jasmine.Spy;
    const MOCK_QUIZ: Quiz = {
        id: '123',
        title: 'Math Quiz',
        description: 'its a math quiz.',
        duration: 30,
        lastModification: '2023-09-15',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 50,
                choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
            },
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 20,
                choices: [
                    { text: '1', isCorrect: false },
                    { text: '2', isCorrect: true },
                    { text: '3', isCorrect: true },
                ],
            },
        ],
        visible: true,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameTestService, { provide: QuizService, useValue: jasmine.createSpyObj('QuizService', ['basicGetById']) }],
        });

        gameTestService = TestBed.inject(GameTestService);
        quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        gameTestService.reset();
    });

    it('should call quizService.basicGetById with the provided quizId', () => {
        const quizId = '123';
        gameTestService.getQuiz(quizId);

        expect(quizService.basicGetById).toHaveBeenCalledWith(quizId);
    });

    it('should return false when currQuestionIndex is at the end of questions', () => {
        const TIMER_VALUE = 10;
        const TIMER1 = gameTestService.timeService.createTimer(TIMER_VALUE);
        gameTestService.timeService.getTimer(0);
        expect(gameTestService.timeService.getTimer(0)).toBe(TIMER1);

        gameTestService.currQuestionIndex = 1;
        gameTestService.quiz = MOCK_QUIZ;
        expect(gameTestService.next()).toBe(false);
    });

    it('should increment currQuestionIndex when it is less than quiz questions lenght -1', () => {
        const TIMER_VALUE = 10;
        gameTestService.timeService.createTimer(TIMER_VALUE);
        gameTestService.timeService.getTimer(0);
        gameTestService.quiz = MOCK_QUIZ;
        gameTestService.currQuestionIndex = 0;
        gameTestService.next();
        expect(gameTestService.currQuestionIndex).toBe(1);
    });

    it('should set isBonus to false and return when the correct answer lenght is false', () => {
        gameTestService.quiz = MOCK_QUIZ;

        const answers = new Map<number, string | null>([
            [0, 'Choice 1'],
            [1, 'Choice 2'],
        ]);

        gameTestService.currQuestionIndex = 0;

        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(false);
    });

    it('should set isBonus to false and return when at least 1 answer is incorrect', () => {
        gameTestService.quiz = MOCK_QUIZ;

        const answers = new Map<number, string | null>([
            [0, 'Choice 1'],
            [2, 'Choice 2'],
        ]);

        gameTestService.currQuestionIndex = 1;

        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(false);
    });

    it('should set isBonus to true and add the bonus to the player score', () => {
        const BONUS_MULT = 1.2;
        gameTestService.quiz = MOCK_QUIZ;

        const answers = new Map<number, string | null>([
            [1, '2'],
            [2, '3'],
        ]);

        gameTestService.currQuestionIndex = 1;

        gameTestService.updateScore(answers);

        expect(gameTestService.isBonus).toBe(true);
        expect(gameTestService.playerScore).toBe(MOCK_QUIZ.questions[1].points * BONUS_MULT);
    });

    it('should start a timer from the timeService', () => {
        const DURATION = 20;
        spyOn(gameTestService.timeService, 'deleteAllTimers');
        spyOn(gameTestService.timeService, 'startTimer');
        gameTestService.timeService.createTimer(DURATION);
        gameTestService.startTimer(DURATION);
        expect(gameTestService.timeService.deleteAllTimers).toHaveBeenCalled();
        expect(gameTestService.timer).toEqual(gameTestService.timeService.createTimer(DURATION));
        expect(gameTestService.timeService.startTimer).toHaveBeenCalledWith(0);
    });

    it('should reset the question parameters', () => {
        spyOn(gameTestService.timeService, 'deleteAllTimers');
        gameTestService.reset();
        expect(gameTestService.timeService.deleteAllTimers).toHaveBeenCalled();
        expect(gameTestService.playerScore).toBe(0);
        expect(gameTestService.currQuestionIndex).toBe(0);
        expect(gameTestService.isBonus).toBe(false);
    });

    it('should return the correct answers of a question choices', () => {
        gameTestService.quiz = MOCK_QUIZ;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extractCorrectChoicesSpy = spyOn<any>(gameTestService, 'extractCorrectChoices').and.callThrough();
        expect(extractCorrectChoicesSpy(MOCK_QUIZ.questions[1].choices)).toEqual([
            { text: '2', isCorrect: true },
            { text: '3', isCorrect: true },
        ]);
    });
});
