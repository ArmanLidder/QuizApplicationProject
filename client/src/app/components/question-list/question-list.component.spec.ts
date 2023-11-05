import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionType } from '@common/interfaces/quiz.interface';
import { FormChoice, FormQuestion, QuizCreationService } from '@app/services/quiz-creation.service/quiz-creation.service';
import { QuestionListComponent } from './question-list.component';
import SpyObj = jasmine.SpyObj;

const fb = new FormBuilder();
const POPUP_DELAY = 3200;
const createFormQuestionFormGroup = (question: FormQuestion): FormGroup => {
    return fb.group({
        type: [question.type],
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

describe('QuestionListComponent', () => {
    let formBuilder: FormBuilder;
    let quizCreationServiceMock: SpyObj<QuizCreationService>;
    let component: QuestionListComponent;
    let fixture: ComponentFixture<QuestionListComponent>;
    let formQuestionsArrayAllSaved: FormArray;
    let question1: FormQuestion;
    let question3: FormQuestion;

    beforeEach(() => {
        quizCreationServiceMock = jasmine.createSpyObj('QuizCreationService', [
            'addQuestion',
            'removeQuestion',
            'modifyQuestion',
            'saveQuestion',
            'moveQuestionUp',
            'moveQuestionDown',
            'moveChoiceUp',
            'moveChoiceDown',
            'addChoice',
            'addChoiceFirst',
            'removeChoice',
            'getChoicesArray',
        ]);
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

        // Create FormQuestion objects
        question1 = {
            type: QuestionType.QCM,
            text: 'Question 1',
            points: 10,
            choices: [choice1, choice2],
            beingModified: false,
        };

        question3 = {
            type: QuestionType.QCM,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };
        formQuestionsArrayAllSaved = fb.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)]);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionListComponent],
            imports: [HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
            providers: [{ provide: QuizCreationService, useValue: quizCreationServiceMock }],
        }).compileComponents();
    }));

    beforeEach(() => {
        const question = {
            type: 'QCM',
            text: 'ffff',
            points: 30,
            choices: [
                {
                    text: 'EEEEE',
                    isCorrect: 'false',
                },
                {
                    text: 'EEEEE',
                    isCorrect: 'true',
                },
            ],
        };
        formBuilder = TestBed.inject(FormBuilder);
        const parentFormGroup: FormGroup = formBuilder.group({
            title: ['titre', Validators.required],
            duration: [0, Validators.required],
            description: ['description', Validators.required],
            questions: formBuilder.array([createFormQuestionFormGroup(question1), createFormQuestionFormGroup(question3)], Validators.required),
        });
        fixture = TestBed.createComponent(QuestionListComponent);
        component = fixture.componentInstance;
        component.questionsArray?.push(question);
        component.parentGroup = parentFormGroup;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add a question-list', () => {
        quizCreationServiceMock.addQuestion.and.returnValue([]);
        component.addQuestion(0);
        expect(quizCreationServiceMock.addQuestion).toHaveBeenCalledOnceWith(0, component.questionsArray);
        expect(component.questionErrors).toEqual([]);
    });

    it('should remove a question-list', () => {
        component.questionsArray = formQuestionsArrayAllSaved;
        component.removeQuestion(0);
        expect(quizCreationServiceMock.removeQuestion).toHaveBeenCalledOnceWith(0, component.questionsArray);
    });

    it('should modify a question-list', () => {
        quizCreationServiceMock.modifyQuestion.and.returnValue([]);
        component.modifyQuestion(0);
        expect(quizCreationServiceMock.modifyQuestion).toHaveBeenCalledOnceWith(0, component.questionsArray);
        expect(component.questionErrors).toEqual([]);
    });

    it('should save a question-list', () => {
        quizCreationServiceMock.saveQuestion.and.returnValue([]);
        component.saveQuestion(0);
        expect(quizCreationServiceMock.saveQuestion).toHaveBeenCalledOnceWith(0, component.questionsArray);
        expect(component.questionErrors).toEqual([]);
    });

    it('should move a question-list up', () => {
        component.moveQuestionUp(0);
        expect(quizCreationServiceMock.moveQuestionUp).toHaveBeenCalledOnceWith(0, component.questionsArray);
    });

    it('should move a question-list down', () => {
        component.moveQuestionDown(0);
        expect(quizCreationServiceMock.moveQuestionDown).toHaveBeenCalledOnceWith(0, component.questionsArray);
    });

    it('should move a choice up', () => {
        component.moveChoiceUp(0, 0);
        expect(quizCreationServiceMock.moveChoiceUp).toHaveBeenCalledOnceWith(0, 0, component.questionsArray);
    });

    it('should move a choice down', () => {
        component.moveChoiceDown(0, 0);
        expect(quizCreationServiceMock.moveChoiceDown).toHaveBeenCalledOnceWith(0, 0, component.questionsArray);
    });

    it('should add a choice', () => {
        component.addChoice(0, 0);
        expect(quizCreationServiceMock.addChoice).toHaveBeenCalledOnceWith(0, 0, component.questionsArray);
    });

    it('should remove a choice', () => {
        component.removeChoice(0, 0);
        expect(quizCreationServiceMock.removeChoice).toHaveBeenCalledOnceWith(0, 0, component.questionsArray);
    });

    it('should get choices array', () => {
        quizCreationServiceMock.getChoicesArray.and.returnValue(
            fb.array([
                fb.group({
                    text: ['', Validators.required],
                    isCorrect: [false],
                }),
                fb.group({
                    text: ['', Validators.required],
                    isCorrect: [false],
                }),
            ]),
        );
        component.questionsArray = formQuestionsArrayAllSaved;
        const choicesArray = component.getChoicesArray(0);
        expect(choicesArray.length).toBe(formQuestionsArrayAllSaved.length);
    });

    it('should show a popup if condition is met', () => {
        component.showPopupIfConditionMet(true);
        expect(component.isPopupVisible).toBeTrue();
    });

    it('should hide a popup after timeout if condition is met', fakeAsync(() => {
        component.showPopupIfConditionMet(true);
        tick(POPUP_DELAY);
        expect(component.isPopupVisible).toBeFalse();
    }));

    it('should not show a popup if condition is not met', () => {
        component.showPopupIfConditionMet(false);
        expect(component.isPopupVisible).toBeFalse();
    });

    it('shouldn t add a question-list when the validator is not valid', () => {
        quizCreationServiceMock.addQuestion.and.returnValue([]);
        component.addQuestion(1);
        expect(quizCreationServiceMock.addQuestion).toHaveBeenCalledOnceWith(1, component.questionsArray);
        component.questionErrors?.push('Question 1 : les points doivent être entre 10 et 60 et être divisible par 10');
        component.showPopupIfConditionMet(component.questionErrors.length !== 0);
        expect(component.isPopupVisible).toBeTrue();
    });
});
