import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimeService } from '@app/services/time.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
// import { QuizChoice } from '@app/interfaces/quiz.interface';
// import { QuizService } from '@app/services/quiz.service';
import SpyObj = jasmine.SpyObj;
import { QuestionType, Quiz } from '@app/interfaces/quiz.interface';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    // let quizServiceSpy: SpyObj<QuizService>;
    let timeServiceSpy: SpyObj<TimeService>;
    let onCardSelectedSpy: jasmine.Spy;
    let resetInfoSpy: jasmine.Spy;
    const mockQuiz: Quiz = {
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
    const mockChoices = [
        { text: 'test', isCorrect: true },
        { text: 'test', isCorrect: false },
        { text: 'test', isCorrect: true },
        { text: 'test', isCorrect: false },
    ];
    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'deleteAllTimers', 'createTimer', 'getTime']);
        Object.defineProperty(timeServiceSpy, 'timersArray', {
            get: () => {
                return [];
            },
        });
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [HttpClientModule, RouterTestingModule],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.quiz = mockQuiz;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should deal correctly with enter button', () => {
        onCardSelectedSpy = spyOn(component, 'onCardSelected');
        component.clickedValidation = false;
        component.answerChoices = [];

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);
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

        const event = new KeyboardEvent('keydown', { key: '3' });
        component.buttonDetect(event);
        expect(onCardSelectedSpy).not.toHaveBeenCalled();

        const event2 = new KeyboardEvent('keydown', { key: '2' });
        component.buttonDetect(event2);
        expect(onCardSelectedSpy).toHaveBeenCalled();
    });

    it('should increment number of correct cards', () => {
        component.answerChoices = mockChoices;
        component.numberOfcorrectCards = 0;
        component.selectedCard = [false, false, false, false];
        component.onCardSelected(0);

        expect(component.selectedCard[0]).toBe(true);
        expect(component.numberOfcorrectCards).toBe(1);
    });
    it('should decrement number of correct cards', () => {
        component.answerChoices = mockChoices;
        component.numberOfcorrectCards = 1;
        component.selectedCard = [true, false, false, false];
        component.onCardSelected(0);

        expect(component.selectedCard[0]).toBe(false);
        expect(component.numberOfcorrectCards).toBe(0);
    });
    it('should increment number of incorrect cards', () => {
        component.answerChoices = mockChoices;
        component.numberOfIncorrectCards = 0;
        component.selectedCard = [false, false, false, false];
        component.onCardSelected(1);

        expect(component.selectedCard[1]).toBe(true);
        expect(component.numberOfIncorrectCards).toBe(1);
    });
    it('should decrement number of incorrect cards', () => {
        component.answerChoices = mockChoices;
        component.numberOfIncorrectCards = 1;
        component.selectedCard = [false, true, false, false];
        component.onCardSelected(1);

        expect(component.selectedCard[1]).toBe(false);
        expect(component.numberOfIncorrectCards).toBe(0);
    });

    it('resetInfos should set the variables properly', () => {
        component.numberOfIncorrectCards = 3;
        component.numberOfcorrectCards = 2;
        component.selectedCard = [true, true, false, false];
        component.questionIndex = 5;
        component.clickedValidation = true;
        component.timeEnd = true;
        component.initInfos = false;
        component.currentTimerIndex = 1;
        const EXPECTEDINDEX = 6;

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
        expect(component.numberOfcorrectCards).toBe(0);
        expect(component.selectedCard).toEqual([false, false, false, false]);
        expect(component.questionIndex).toBe(EXPECTEDINDEX);
        expect(component.clickedValidation).toBe(false);
        expect(component.timeEnd).toBe(false);
        expect(component.initInfos).toBe(true);
        expect(component.currentTimerIndex).toBe(0);

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
        const answerChoices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: true },
            { text: 'Choice 4', isCorrect: false },
        ];

        component.answerChoices = answerChoices;

        component.setNumberOfCorrectAnswers();

        expect(component.numberOfCorrectAnswers).toBe(2);
    });

    it('should lock or unlock button correctly', () => {
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
        const EXPECTEDPOINTAGE = 150;
        component.timeEnd = false;
        component.currentTimerIndex = 0;
        component.numberOfcorrectCards = 2;
        component.numberOfCorrectAnswers = 2;
        component.numberOfIncorrectCards = 0;
        component.pointage = 100;
        component.questionPoints = 50;
        component.bonusPointMultiplicator = 1;

        timeServiceSpy.getTime.and.returnValue(0);

        component.timeElapsedConditions();

        expect(component.pointage).toEqual(EXPECTEDPOINTAGE);
        expect(component.timeEnd).toBe(true);
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
    });
});
