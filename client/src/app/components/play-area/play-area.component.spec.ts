import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimeService } from '@app/services/time.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import SpyObj = jasmine.SpyObj;
import { QuestionType, Quiz } from '@common/interfaces/quiz.interface';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuizService } from '@app/services/quiz.service';
import { of } from 'rxjs';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let router: Router;
    let onCardSelectedSpy: jasmine.Spy;
    let resetInfoSpy: jasmine.Spy;
    let quizService: jasmine.SpyObj<QuizService>;
    let runGameSpy: jasmine.Spy;
    let validationButtonLockedSpy: jasmine.Spy;
    let setNumberOfCorrectAnswersSpy: jasmine.Spy;
    let timeElapsedConditionsSpy: jasmine.Spy;

    const MOCK_QUIZ: Quiz = {
        id: '1',
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
                points: 50,
                choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
            },
        ],
        visible: true,
    };
    const MOCK_CHOICES = [
        { text: 'test', isCorrect: true },
        { text: 'test', isCorrect: false },
        { text: 'test', isCorrect: true },
        { text: 'test', isCorrect: false },
    ];
    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'deleteAllTimers', 'createTimer', 'getTime', 'setTime']);
        Object.defineProperty(timeServiceSpy, 'timersArray', {
            get: () => {
                return [];
            },
        });

        quizService = jasmine.createSpyObj('QuizService', ['basicGetById']);
        TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule, RouterTestingModule, FormsModule],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: QuizService, useValue: quizService },
            ],
        });
        await TestBed.compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.quiz = MOCK_QUIZ;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should deal correctly with enter button', () => {
        onCardSelectedSpy = spyOn(component, 'onCardSelected');
        component.clickedValidation = false;
        component.answerChoices = [];

        const EVENT = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(EVENT);
        expect(component.clickedValidation).toBe(true);
        expect(onCardSelectedSpy).not.toHaveBeenCalled();
    });

    it('should deal correctly with number button presses', () => {
        onCardSelectedSpy = spyOn(component, 'onCardSelected');
        component.answerChoices = [
            { text: 'test', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        component.clickedValidation = false;

        const EVENT = new KeyboardEvent('keydown', { key: '3' });
        component.buttonDetect(EVENT);
        expect(onCardSelectedSpy).not.toHaveBeenCalled();

        const EVENT_2 = new KeyboardEvent('keydown', { key: '2' });
        component.buttonDetect(EVENT_2);
        expect(onCardSelectedSpy).toHaveBeenCalled();
    });

    it('should increment number of correct cards', () => {
        component.answerChoices = MOCK_CHOICES;
        component.numberOfCorrectCards = 0;
        component.selectedCard = [false, false, false, false];
        component.onCardSelected(0);

        expect(component.selectedCard[0]).toBe(true);
        expect(component.numberOfCorrectCards).toBe(1);
    });
    it('should decrement number of correct cards', () => {
        component.answerChoices = MOCK_CHOICES;
        component.numberOfCorrectCards = 1;
        component.selectedCard = [true, false, false, false];
        component.onCardSelected(0);

        expect(component.selectedCard[0]).toBe(false);
        expect(component.numberOfCorrectCards).toBe(0);
    });
    it('should increment number of incorrect cards', () => {
        component.answerChoices = MOCK_CHOICES;
        component.numberOfIncorrectCards = 0;
        component.selectedCard = [false, false, false, false];
        component.onCardSelected(1);

        expect(component.selectedCard[1]).toBe(true);
        expect(component.numberOfIncorrectCards).toBe(1);
    });
    it('should decrement number of incorrect cards', () => {
        component.answerChoices = MOCK_CHOICES;
        component.numberOfIncorrectCards = 1;
        component.selectedCard = [false, true, false, false];
        component.onCardSelected(1);

        expect(component.selectedCard[1]).toBe(false);
        expect(component.numberOfIncorrectCards).toBe(0);
    });

    it('resetInfos should set the variables properly', () => {
        component.numberOfIncorrectCards = 3;
        component.numberOfCorrectCards = 2;
        component.selectedCard = [true, true, false, false];
        component.questionIndex = 5;
        component.clickedValidation = true;
        component.timeEnd = true;
        component.initInfos = false;
        component.currentTimerIndex = 1;
        component.addingPoints = true;
        const EXPECTED_INDEX = 6;

        component.quiz = {
            id: '1',
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
            ],
            visible: true,
        };

        component.resetInfos();

        expect(component.numberOfIncorrectCards).toBe(0);
        expect(component.numberOfCorrectCards).toBe(0);
        expect(component.selectedCard).toEqual([false, false, false, false]);
        expect(component.questionIndex).toBe(EXPECTED_INDEX);
        expect(component.clickedValidation).toBe(false);
        expect(component.timeEnd).toBe(false);
        expect(component.initInfos).toBe(true);
        expect(component.currentTimerIndex).toBe(0);
        expect(component.addingPoints).toBe(false);

        expect(timeServiceSpy.deleteAllTimers).toHaveBeenCalled();
        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(component.quiz.duration);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(0);
    });

    it('should set question-related properties and timers', () => {
        component.currentQuestion = '';
        component.questionPoints = 0;
        component.answerChoices = undefined;

        component.currentTimerIndex = 1;

        component.setQuestionInfos();

        expect(component.currentQuestion).toBe(component.quiz.questions[component.questionIndex].text);
        expect(component.questionPoints).toBe(component.quiz.questions[component.questionIndex].points);

        if (component.answerChoices) {
            expect(component.answerChoices).toEqual(component.quiz.questions[component.questionIndex].choices);
        }

        expect(component.currentTimerIndex).toBe(0);

        expect(timeServiceSpy.deleteAllTimers).toHaveBeenCalled();
        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(component.quiz.duration);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(0);
    });

    it('should set the number of correct answers', () => {
        component.answerChoices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: true },
            { text: 'Choice 4', isCorrect: false },
        ];

        component.setNumberOfCorrectAnswers();

        expect(component.numberOfCorrectAnswers).toBe(2);
    });

    it('should lock or unlock button correctly', () => {
        component.timeEnd = false;
        component.clickedValidation = true;
        component.validationButtonLocked();
        expect(timeServiceSpy.setTime).toHaveBeenCalledWith(component.currentTimerIndex, 0);

        component.timeEnd = true;
        component.clickedValidation = false;
        component.validationButtonLocked();
        expect(component.disableOption).toBe(true);
        expect(component.bgColor).toBe('green');

        component.timeEnd = false;
        component.clickedValidation = false;
        component.validationButtonLocked();
        expect(component.disableOption).toBe(false);
        expect(component.bgColor).toBe('transparent');
    });

    it('should handle time elapsed conditions when timeEnd is false and timer reaches 0', () => {
        const EXPECTED_POINTAGE = 150;
        component.timeEnd = false;
        component.currentTimerIndex = 0;
        component.numberOfCorrectCards = 2;
        component.numberOfCorrectAnswers = 2;
        component.numberOfIncorrectCards = 0;
        component.pointage = 100;
        component.questionPoints = 50;
        component.bonusPointMultiplicator = 1;
        component.addingPoints = false;

        timeServiceSpy.getTime.and.returnValue(0);

        component.timeElapsedConditions();

        expect(component.pointage).toEqual(EXPECTED_POINTAGE);
        expect(component.timeEnd).toBe(true);
        expect(component.addingPoints).toBe(true);
        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(component.currentTimerIndex - 1);
        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(component.validationTime);
        expect(component.currentTimerIndex).toBe(1);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component.currentTimerIndex);
    });

    it('should handle time elapsed conditions when question time ends', () => {
        component.timeEnd = true;
        component.questionIndex = 0;
        component.currentTimerIndex = 0;
        timeServiceSpy.getTime.and.returnValue(0);
        resetInfoSpy = spyOn(component, 'resetInfos');
        component.timeElapsedConditions();
        expect(resetInfoSpy).toHaveBeenCalled();

        component.quiz.questions.length = 5;
        component.questionIndex = 5;
        spyOn(router, 'navigate');
        component.timeElapsedConditions();
        expect(router.navigate).toHaveBeenCalledWith(['/game-creation-page']);
    });

    it('should run all the fuction used in the runGame function', () => {
        jasmine.clock().install();
        validationButtonLockedSpy = spyOn(component, 'validationButtonLocked');
        setNumberOfCorrectAnswersSpy = spyOn(component, 'setNumberOfCorrectAnswers');
        timeElapsedConditionsSpy = spyOn(component, 'timeElapsedConditions');
        component.initInfos = true;
        component.clearInterval = true;
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        const CLOCK_TICK = 4000;
        component.runGame();
        jasmine.clock().tick(CLOCK_TICK);
        expect(validationButtonLockedSpy).toHaveBeenCalled();
        expect(setNumberOfCorrectAnswersSpy).toHaveBeenCalled();
        expect(timeElapsedConditionsSpy).toHaveBeenCalled();
        expect(component.initInfos).toBe(false);
        expect(timeServiceSpy.deleteAllTimers).toHaveBeenCalled();
        expect(clearIntervalSpy).toHaveBeenCalledWith(component.intervalId);
        jasmine.clock().uninstall();
    });

    it('should look at if it is a test version and call runGame', () => {
        component.tempPath = false;
        quizService.basicGetById.and.returnValue(of(MOCK_QUIZ));
        runGameSpy = spyOn(component, 'runGame');
        const FAKE_VALIDATION_TIME = 3;
        const FAKE_BONUS_POINT_MULTI = 1.2;
        component.ngOnInit();

        expect(component.validationTime).toBe(FAKE_VALIDATION_TIME);
        expect(component.bonusPointMultiplicator).toBe(FAKE_BONUS_POINT_MULTI);
        expect(component.initInfos).toBe(true);
        expect(component.quiz).toBe(MOCK_QUIZ);
        expect(runGameSpy).toHaveBeenCalled();
    });

    it('should set clearInterval to true when we leave a page with ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(component.clearInterval).toBe(true);
    });
});
