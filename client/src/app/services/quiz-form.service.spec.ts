import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import SpyObj = jasmine.SpyObj;
import { QuizFormService } from '@app/services/quiz-form.service';
import { createFormQuestionFormGroup } from 'src/utils/create-form-question';

describe('QuizFormService', () => {
    let service: QuizFormService;
    let quizValidationServiceSpy: SpyObj<QuizValidationService>;
    let formQuestionsArrayAllSaved: FormArray;
    let firstQuestion: QuizQuestion;
    let secondQuestion: QuizQuestion;
    let firstChoice: QuizChoice;
    let secondChoice: QuizChoice;
    let validQuiz: Quiz;

    const fb: FormBuilder = new FormBuilder();

    beforeEach(() => {
        quizValidationServiceSpy = jasmine.createSpyObj('QuizValidationService', [
            'validateQuiz',
            'validateQuestion',
            'divisibleByTen',
            'validateChoicesForm',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                QuizFormService,
                FormBuilder,
                {
                    provide: QuizValidationService,
                    useValue: quizValidationServiceSpy,
                },
            ],
        });
        service = TestBed.inject(QuizFormService);
    });

    beforeEach(() => {
        const choice1: FormChoice = {
            text: 'Choice 1',
            isCorrect: true,
        };

        const choice2: FormChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        firstChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        secondChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        const question1: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        const question3: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };

        formQuestionsArrayAllSaved = fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)]);

        firstQuestion = {
            type: QuestionType.QCM,
            text: 'first question',
            points: 50,
            choices: [],
        };

        secondQuestion = {
            type: QuestionType.QCM,
            text: 'second question',
            points: 40,
            choices: [],
        };

        validQuiz = {
            id: '1',
            title: 'Test Quiz',
            description: 'This is a test quiz',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Sample Question 1',
                    points: 20,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
            visible: false,
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a FormGroup with default values when no quiz is provided', () => {
        spyOn(service, 'fillQuestions');
        const quizForm: FormGroup = service.fillForm();
        expect(quizForm.get('title')?.value).toBe(null);
        expect(service.fillQuestions).toHaveBeenCalled();
        expect(quizForm.get('duration')?.value).toBe(null);
        expect(quizForm.get('description')?.value).toBe(null);
        expect(quizForm.get('questions')).toBeTruthy();
    });

    it('should return a FormGroup with values from the provided quiz when calling fillForm', () => {
        const quizForm: FormGroup = service.fillForm(validQuiz);
        expect(quizForm.get('title')?.value).toBe(validQuiz.title);
        expect(quizForm.get('duration')?.value).toBe(validQuiz.duration);
        expect(quizForm.get('description')?.value).toBe(validQuiz.description);
        expect(quizForm.get('questions')).toBeTruthy();
        expect((quizForm.get('questions') as FormArray).at(0).get('text')?.value).toEqual(validQuiz.questions[0].text);
    });

    it('should call initQuestion for each question in the array', () => {
        const quizQuestions = [firstQuestion, secondQuestion];
        spyOn(service, 'initQuestion').and.callThrough();
        service.fillQuestions(formQuestionsArrayAllSaved, quizQuestions);
        expect(service.initQuestion).toHaveBeenCalledTimes(quizQuestions.length);
    });

    it('should not call initQuestion if questions array is empty', () => {
        const emptyQuestionsArray: QuizQuestion[] = [];
        spyOn(service, 'initQuestion').and.callThrough();
        service.fillQuestions(formQuestionsArrayAllSaved, emptyQuestionsArray);
        expect(service.initQuestion).not.toHaveBeenCalled();
    });

    it('should call initChoice for each choice in the array', () => {
        const quizChoices = [firstChoice, secondChoice];
        spyOn(service, 'initChoice').and.callThrough();
        service.fillChoices(formQuestionsArrayAllSaved, quizChoices);
        expect(service.initChoice).toHaveBeenCalledTimes(quizChoices.length);
    });

    it('should not call initQuestion if questions array is empty', () => {
        const emptyChoicesArray: QuizChoice[] = [];
        spyOn(service, 'initChoice').and.callThrough();
        service.fillChoices(formQuestionsArrayAllSaved, emptyChoicesArray);
        expect(service.initChoice).not.toHaveBeenCalled();
    });

    it('should call fillChoices method when calling initQuestion', () => {
        spyOn(service, 'fillChoices');
        quizValidationServiceSpy.divisibleByTen.and.returnValue({ notDivisibleByTen: true });
        quizValidationServiceSpy.validateChoicesForm.and.returnValue({ invalidChoices: true });
        service.initQuestion(firstQuestion);
        expect(service.fillChoices).toHaveBeenCalled();
        expect(quizValidationServiceSpy.divisibleByTen).toHaveBeenCalled();
        expect(quizValidationServiceSpy.validateChoicesForm).toHaveBeenCalled();
    });

    it('should create a FormGroup for a new QCM question with provided values', () => {
        const questionForm = service.initQuestion(firstQuestion);
        expect(questionForm.value).toEqual({
            type: 'QCM',
            text: firstQuestion.text,
            points: firstQuestion.points,
            choices: firstQuestion.choices,
            beingModified: false,
        });
    });

    it('should create a FormGroup with default values if no question is provided', () => {
        const questionForm = service.initQuestion();
        expect(questionForm.value).toEqual({
            type: 'QLR', // Default type
            text: '',
            points: 0, // Default points
            choices: [],
            beingModified: true,
        });
    });

    it('should create a FormGroup for a new choice with provided values', () => {
        const choiceForm = service.initChoice(firstChoice);
        expect(choiceForm.value).toEqual({
            text: firstChoice.text,
            isCorrect: firstChoice.isCorrect ? 'true' : 'false',
        });
    });

    it('should extract values from a QCM question form', () => {
        const questionForm = fb.group({
            type: 'QCM',
            text: 'Sample QCM Question',
            points: 60,
            choices: fb.array([
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ]),
        });

        const extractedQuestion = service.extractQuestion(questionForm);
        expect(extractedQuestion).toEqual({
            type: QuestionType.QCM,
            text: 'Sample QCM Question',
            points: 60,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        });
    });

    it('should return an empty QuizQuestion when the form is empty', () => {
        const questionForm = fb.group({
            type: '',
            text: '',
            points: 0,
            choices: fb.array([]),
        });
        const extractedQuestion = service.extractQuestion(questionForm);
        expect(extractedQuestion).toEqual({
            type: QuestionType.QLR,
            text: '',
            points: 0,
            choices: [],
        });
    });
});
