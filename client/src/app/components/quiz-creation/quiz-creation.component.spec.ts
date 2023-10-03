import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageMode, QuizCreationComponent } from './quiz-creation.component';
import { FormChoice, FormQuestion, QuizCreationService } from '@app/services/quiz-creation.service';
import { QuizService } from '@app/services/quiz.service';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { QuestionListComponent } from '@app/components/question/question-list.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { of } from 'rxjs';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@app/interfaces/quiz.interface';
import SpyObj = jasmine.SpyObj;

const createFormQuestionFormGroup = (question: FormQuestion, fb: FormBuilder): FormGroup => {
    return fb.group({
        type: [question.type === QuestionType.QCM ? 'QCM' : 'QLR'],
        text: [question.text, Validators.required],
        points: [question.points],
        choices: fb.array(
            question.choices.map((choice: FormChoice) =>
                fb.group({
                    text: [choice.text],
                    isCorrect: [choice.isCorrect],
                }),
            ),
        ),
        beingModified: [question.beingModified],
    });
};
describe('QuizCreationComponent', () => {
    let component: QuizCreationComponent;
    let fixture: ComponentFixture<QuizCreationComponent>;
    let quizCreationServiceMock: SpyObj<QuizCreationService>;
    let quizServiceMock: SpyObj<QuizService>;
    let activatedRoute: ActivatedRoute;
    let routerMock: SpyObj<Router>;
    let mockQuiz: Quiz;
    let question1: FormQuestion;
    let question3: FormQuestion;
    let formBuilder: FormBuilder;
    const POPUP_DELAY = 3000;
    beforeEach(() => {
        quizCreationServiceMock = jasmine.createSpyObj('QuizCreationService', ['fillForm', 'validateQuiz']);
        quizServiceMock = jasmine.createSpyObj('QuizService', ['basicGetById', 'basicPut', 'basicPost', 'checkTitleUniqueness']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        mockQuiz = {
            id: '1',
            title: 'Sample Quiz',
            description: 'This is a sample quiz',
            duration: 30,
            lastModification: '2023-10-10T12:00:00Z',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'What is the capital of France?',
                    points: 10,
                    choices: [
                        { text: 'Paris', isCorrect: true },
                        { text: 'Berlin', isCorrect: false },
                        { text: 'Madrid', isCorrect: false },
                    ],
                },
                {
                    type: QuestionType.QLR,
                    text: 'What is 2 + 2?',
                    points: 5,
                },
            ],
            visible: true,
        };
        const choice1: FormChoice = {
            text: 'Choice 1',
            isCorrect: true,
        };

        const choice2: FormChoice = {
            text: 'Choice 2',
            isCorrect: false,
        };

        // Create FormQuestion objects
        question1 = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        question3 = {
            type: QuestionType.QLR,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };
        quizServiceMock.basicGetById.and.returnValue(of(mockQuiz));
        quizServiceMock.basicPut.and.returnValue(of());
        quizServiceMock.basicPost.and.returnValue(of());
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: true } })));
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuizCreationComponent, QuestionListComponent],
            imports: [ReactiveFormsModule, FormsModule, HttpClientModule, AppMaterialModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => '123',
                            },
                        },
                    },
                },
                {
                    provide: Router,
                    useValue: routerMock,
                },
                FormBuilder,
                { provide: QuizCreationService, useValue: quizCreationServiceMock },
                {
                    provide: QuizService,
                    useValue: quizServiceMock,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        formBuilder = TestBed.inject(FormBuilder);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        activatedRoute = TestBed.inject(ActivatedRoute);
        component.quizForm = formBuilder.group({
            title: ['titre', Validators.required],
            duration: [0, Validators.required],
            description: ['description', Validators.required],
            questions: formBuilder.array(
                [createFormQuestionFormGroup(question1, formBuilder), createFormQuestionFormGroup(question3, formBuilder)],
                Validators.required,
            ),
            visible: [false, Validators.required],
        });
        component['quizService'] = TestBed.inject(QuizService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize in CREATION mode with null ID', () => {
        const customGet = () => {
            return null;
        };
        spyOn(activatedRoute.snapshot.paramMap, 'get').and.callFake(customGet);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        expect(component.quizCreationService.fillForm).toHaveBeenCalledWith();
        expect(component.mode).toBe(PageMode.CREATION);
    });

    it('should initialize in MODIFICATION mode when existing ID', () => {
        const customGet = (paramName: string) => {
            if (paramName === 'id') {
                return '4';
            }
            return null;
        };
        spyOn(activatedRoute.snapshot.paramMap, 'get').and.callFake(customGet);
        fixture = TestBed.createComponent(QuizCreationComponent);
        component = fixture.componentInstance;
        expect(component['quizService'].basicGetById).toHaveBeenCalledWith(customGet('id') as string);
        expect(component.quizCreationService.fillForm).toHaveBeenCalledWith(mockQuiz);
        expect(component.mode).toBe(PageMode.MODIFICATION);
    });

    it('should return the questions FormArray', () => {
        const questionsArray = component.questionsArray;
        // Check the length of the FormArray
        expect(questionsArray.length).toBe(2); // Assuming two questions were mocked
    });

    it('should set isPopupVisibleForm to true and then false when condition is true', fakeAsync(() => {
        component.isPopupVisibleForm = false;
        const condition = true;
        component.showPopupIfFormConditionMet(condition);
        expect(component.isPopupVisibleForm).toBeTruthy();
        tick(POPUP_DELAY);
        expect(component.isPopupVisibleForm).toBeFalsy();
    }));

    it('should not change isPopupVisibleForm when condition is false', () => {
        component.isPopupVisibleForm = false;
        const condition = false;
        component.showPopupIfFormConditionMet(condition);
        expect(component.isPopupVisibleForm).toBe(false);
    });

    it('should extract quiz data from form', () => {
        // Act
        const extractedQuiz: Quiz = component.extractQuizFromForm();
        // Assert
        expect(extractedQuiz.title).toEqual(component.quizForm.get('title')?.value);
        expect(extractedQuiz.description).toEqual(component.quizForm.get('description')?.value);
        expect(extractedQuiz.duration).toEqual(component.quizForm.get('duration')?.value);
        expect(extractedQuiz.visible).toEqual(component.quizForm.get('visible')?.value);
        // Check the questions
        const questionsArray = component.quizForm.get('questions') as FormArray;
        expect(extractedQuiz.questions.length).toEqual(questionsArray.length);
        // Check the first question
        const firstQuestion: QuizQuestion = extractedQuiz.questions[0];
        expect(firstQuestion.type).toEqual(questionsArray.at(0).get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR);
        expect(firstQuestion.text).toEqual(questionsArray.at(0).get('text')?.value);
        expect(firstQuestion.points).toEqual(questionsArray.at(0).get('points')?.value);
        const firstChoiceFirstChoice: QuizChoice[] = firstQuestion.choices as QuizChoice[];
        expect(firstChoiceFirstChoice[0].text).toEqual(questionsArray.at(0).get('choices')?.value[0].text);
        expect(firstChoiceFirstChoice[0].isCorrect).toEqual(questionsArray.at(0).get('choices')?.value[0].isCorrect === 'true');
        expect(firstChoiceFirstChoice[1].text).toEqual(questionsArray.at(0).get('choices')?.value[1].text);
        expect(firstChoiceFirstChoice[1].isCorrect).toEqual(questionsArray.at(0).get('choices')?.value[1].isCorrect === 'true');

        // Check the second question
        const secondQuestion: QuizQuestion = extractedQuiz.questions[1];
        expect(secondQuestion.type).toEqual(questionsArray.at(1).get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR);
        expect(secondQuestion.text).toEqual(questionsArray.at(1).get('text')?.value);
        expect(secondQuestion.points).toEqual(questionsArray.at(1).get('points')?.value);
        const firstChoiceSecondChoice: QuizChoice[] = secondQuestion.choices as QuizChoice[];
        expect(firstChoiceSecondChoice[0].text).toEqual(questionsArray.at(1).get('choices')?.value[0].text);
        expect(firstChoiceSecondChoice[0].isCorrect).toEqual(questionsArray.at(1).get('choices')?.value[0].isCorrect === 'true');
        expect(firstChoiceSecondChoice[1].text).toEqual(questionsArray.at(1).get('choices')?.value[1].text);
        expect(firstChoiceSecondChoice[1].isCorrect).toEqual(questionsArray.at(1).get('choices')?.value[1].isCorrect === 'true');
    });

    it('should call basicPost when mode is CREATION', fakeAsync(() => {
        component.mode = PageMode.CREATION;
        quizServiceMock.basicPost.and.returnValue(of(new HttpResponse({ body: 'success' })));
        component.addOrUpdateQuiz(mockQuiz);
        expect(mockQuiz.id).toBeDefined();
        expect(quizServiceMock.basicPost).toHaveBeenCalledWith(mockQuiz);
        expect(quizServiceMock.basicPut).not.toHaveBeenCalled();
        tick(); // This assumes that the observable completes immediately
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-admin-page']);
    }));

    it('should call basicPut when mode is MODIFICATION', fakeAsync(() => {
        component.mode = PageMode.MODIFICATION;
        quizServiceMock.basicPut.and.returnValue(of(new HttpResponse({ body: 'success' })));
        component.addOrUpdateQuiz(mockQuiz);
        expect(mockQuiz.id).toBeDefined();
        expect(quizServiceMock.basicPut).toHaveBeenCalledWith(mockQuiz);
        expect(quizServiceMock.basicPost).not.toHaveBeenCalled();
        tick(); // This assumes that the observable completes immediately
        expect(routerMock.navigate).toHaveBeenCalledWith(['/game-admin-page']);
    }));

    it('should call addOrUpdateQuiz when form is valid and title is unique', () => {
        component.mode = PageMode.CREATION;
        const title = component.quizForm.value['title'];
        // Spy on addOrUpdateQuiz before calling onSubmit
        spyOn(component, 'addOrUpdateQuiz');
        // Mock the checkTitleUniqueness response
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: true } })));
        component.onSubmit();
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledWith(title);
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledTimes(1);
        expect(component.addOrUpdateQuiz).toHaveBeenCalled();
    });

    it('should show an alert when form is valid but title is not unique', () => {
        // Arrange
        component.mode = PageMode.CREATION;
        const title = component.quizForm.value['title'];
        // Mock a response with a non-unique title
        quizServiceMock.checkTitleUniqueness.and.returnValue(of(new HttpResponse({ body: { isUnique: false } })));
        const windowAlertSpy = spyOn(window, 'alert');

        // Act
        component.onSubmit();

        // Assert
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledWith(title);
        expect(quizServiceMock.checkTitleUniqueness).toHaveBeenCalledTimes(1);
        // Ensure that an alert is shown
        expect(windowAlertSpy).toHaveBeenCalledWith('Un quiz ayant le même titre existe déjà');
    });

    it('should set form errors and show a popup when form is not valid', () => {
        // Arrange
        const showPopupIfFormConditionMetSpy = spyOn(component, 'showPopupIfFormConditionMet');
        // make the quizForm invalid by giving an empty title
        component.quizForm.get('title')?.patchValue('');
        component.onSubmit();
        // Assert
        expect(quizCreationServiceMock.validateQuiz).toHaveBeenCalled();
        // Ensure that showPopupIfFormConditionMet is called
        expect(showPopupIfFormConditionMetSpy).toHaveBeenCalledWith(true);
    });
});
