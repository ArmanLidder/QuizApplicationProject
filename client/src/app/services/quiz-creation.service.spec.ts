/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormChoice, FormQuestion, QuizCreationService } from './quiz-creation.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import SpyObj = jasmine.SpyObj;

const fb = new FormBuilder();

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

describe('QuizCreationService', () => {
    let service: QuizCreationService;
    let quizValidationServiceSpy: SpyObj<QuizValidationService>;
    let formQuestionsArrayOneUnsaved: FormArray;
    let formQuestionsArrayAllSaved: FormArray;
    let formQuestionsArrayOneUnsavedAndInvalid: FormArray;
    let invalidQuestion: FormQuestion;
    let validQuestion: FormQuestion;
    let firstQuestion: QuizQuestion;
    let secondQuestion: QuizQuestion;
    let firstChoice: QuizChoice;
    let secondChoice: QuizChoice;
    let validQuiz: Quiz;

    const NON_EXISTANT_INDEX = -1;
    const LENGTH_TWO = 2;
    const LENGTH_THREE = 3;
    const LENGTH_FOUR = 4;

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
                QuizCreationService,
                FormBuilder,
                {
                    provide: QuizValidationService,
                    useValue: quizValidationServiceSpy,
                },
            ],
        });
        service = TestBed.inject(QuizCreationService);
        service.modifiedQuestionIndex = NON_EXISTANT_INDEX;
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

        const question2: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 2',
            points: 5,
            choices: [choice1],
            beingModified: true,
        };

        const question3: FormQuestion = {
            type: QuestionType.QCM,
            text: 'Question 3',
            points: 15,
            choices: [choice1, choice2],
            beingModified: false,
        };

        invalidQuestion = {
            type: QuestionType.QCM,
            text: '',
            points: 15,
            choices: [choice1, choice2],
            beingModified: true,
        };

        validQuestion = {
            type: QuestionType.QCM,
            text: 'texte',
            points: 40,
            choices: [choice1, choice2],
            beingModified: true,
        };

        // Create FormArray with FormGroup objects for FormQuestion
        formQuestionsArrayOneUnsaved = fb.array([
            createFormQuestionFormGroup(question1),
            createFormQuestionFormGroup(question2),
            createFormQuestionFormGroup(question3),
        ]);

        formQuestionsArrayOneUnsavedAndInvalid = fb.array([
            createFormQuestionFormGroup(question1),
            createFormQuestionFormGroup(invalidQuestion),
            createFormQuestionFormGroup(question3),
        ]);

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

    it('should call validationService.validateQuiz', () => {
        service.validateQuiz(validQuiz);
        expect(quizValidationServiceSpy.validateQuiz).toHaveBeenCalledTimes(1);
        expect(quizValidationServiceSpy.validateQuiz).toHaveBeenCalledWith(validQuiz);
    });

    it('should call initQuestion and not call saveQuestion when modifiedQuestionIndex is NON_EXISTANT_INDEX', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        spyOn(service, 'initQuestion').and.returnValue(createFormQuestionFormGroup(invalidQuestion));
        spyOn(service, 'saveQuestion');
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service.initQuestion).toHaveBeenCalled();
        expect(service.saveQuestion).not.toHaveBeenCalled();
    });

    it('should call saveQuestion when modifiedQuestionIndex is not NON_EXISTANT_INDEX', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        // Arrange
        spyOn(service, 'saveQuestion').and.returnValue([]); // Mock saveQuestion to return an empty array
        // Act
        service.addQuestion(0, questionsArrayForm);
        expect(service.saveQuestion).toHaveBeenCalled();
    });

    it('should call initQuestion when the question has been successfully saved', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        spyOn(service, 'initQuestion').and.returnValue(createFormQuestionFormGroup(invalidQuestion));
        spyOn(service, 'saveQuestion').and.returnValue([]);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service.initQuestion).toHaveBeenCalled();
    });

    it('should not call initQuestion when saveQuestion returns validation errors', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        service.modifiedQuestionIndex = 0;
        spyOn(service, 'initQuestion');
        spyOn(service, 'saveQuestion').and.returnValue(['Validation Error 1', 'Validation Error 2']);
        const result = service.addQuestion(0, questionsArrayForm);
        expect(service.initQuestion).not.toHaveBeenCalled();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should add a question element to an empty array', () => {
        const emptyArray: FormGroup[] = [];
        const questionsArrayForm: FormArray = new FormArray(emptyArray);
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service, 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(0);
        service.addQuestion(NON_EXISTANT_INDEX, questionsArrayForm);
        expect(service.initQuestion).toHaveBeenCalled();
        expect(questionsArrayForm.length).toBe(1);
    });

    it('should add a question element in the right index', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const index = 1;
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service, 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
        service.addQuestion(index, questionsArrayForm);
        expect(questionsArrayForm.at(index + 1).get('text')?.value).toEqual(validQuestion.text);
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
    });

    it('should save the unsaved valid question before adding a new question', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const index = 2;
        const questionToAddForm = createFormQuestionFormGroup(validQuestion);
        spyOn(service, 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(3);
        expect(questionsArrayForm.at(service.modifiedQuestionIndex).get('beingModified')).toBeTruthy();
        service.addQuestion(index, questionsArrayForm);
        expect(service.modifiedQuestionIndex).toBe(index + 1);
        expect(questionsArrayForm.at(index + 1).get('text')?.value).toEqual(validQuestion.text);
        expect(questionsArrayForm.length).toBe(LENGTH_FOUR);
    });

    it('should not add a new question if saving an invalid question', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsavedAndInvalid;
        service.modifiedQuestionIndex = 1;
        const index = 2;
        const questionToAddForm = createFormQuestionFormGroup(invalidQuestion);
        spyOn(service, 'initQuestion').and.returnValue(questionToAddForm);
        expect(questionsArrayForm.length).toBe(3);
        expect(questionsArrayForm.at(service.modifiedQuestionIndex).get('beingModified')).toBeTruthy();
        spyOn(service, 'saveQuestion').and.returnValue(['Validation error']);
        const validationErrors = service.addQuestion(index, questionsArrayForm);
        expect(validationErrors.length).toBeGreaterThan(0);
        expect(service.initQuestion).not.toHaveBeenCalled();
        expect(service.modifiedQuestionIndex).toBe(1);
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
    });

    it('should remove the question that is specified by its index in the array', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToRemove = 1;
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        expect(questionsArrayForm.length).toBe(1);
    });

    it('should remove reset the modified question index if the modified question is removed', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const indexToRemove = 1;
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        expect(service.modifiedQuestionIndex).toBe(NON_EXISTANT_INDEX);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
    });

    it('should change the modified question index accordingly if the modified question is after the removed one', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const indexToRemove = 0;
        expect(questionsArrayForm.length).toBe(LENGTH_THREE);
        service.removeQuestion(indexToRemove, questionsArrayForm);
        // Assert
        expect(service.modifiedQuestionIndex).toBe(0);
        expect(questionsArrayForm.length).toBe(LENGTH_TWO);
    });

    it('should not call saveQuestion and set beingModified to true when modifiedQuestionIndex is NON_EXISTANT_INDEX', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        service.modifiedQuestionIndex = NON_EXISTANT_INDEX;
        const indexToModify = 0;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(result).toEqual([]);
        spyOn(service, 'saveQuestion').and.returnValue([]);
        expect(service.saveQuestion).not.toHaveBeenCalled();
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBeTruthy();
    });

    it('should call saveQuestion and set beingModified to true when modifiedQuestionIndex is not NON_EXISTANT_INDEX', () => {
        // Arrange
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToModify = 0;
        spyOn(service, 'saveQuestion').and.returnValue([]); // Mock saveQuestion to return an empty array
        service.modifiedQuestionIndex = indexToModify;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(result).toEqual([]);
        expect(service.saveQuestion).toHaveBeenCalledWith(indexToModify, questionsArrayForm);
        // Check that beingModified is set to true for the modified question
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBeTruthy();
    });

    it('should call saveQuestion and set beingModified to false when saveQuestion returns a non-empty string array', () => {
        const questionsArrayForm: FormArray = formQuestionsArrayAllSaved;
        const indexToModify = 0;
        spyOn(service, 'saveQuestion').and.returnValue(['Validation Error']);
        service.modifiedQuestionIndex = indexToModify;
        const result = service.modifyQuestion(indexToModify, questionsArrayForm);
        expect(service.saveQuestion).toHaveBeenCalledWith(indexToModify, questionsArrayForm);
        expect(questionsArrayForm.at(indexToModify).get('beingModified')?.value).toBe(false);
        expect(result).toEqual(['Validation Error']);
    });

    it('should call extractQuestion and validateQuestion when the question is invalid and should not save', () => {
        // the second question of this array is unsaved and invalid
        const questionsFormArray = formQuestionsArrayOneUnsavedAndInvalid;
        const unsavedQuestionIndex = 1;
        quizValidationServiceSpy.validateQuestion.and.returnValue(['Validation error']);
        spyOn(service, 'extractQuestion').and.returnValue(invalidQuestion);
        const result = service.saveQuestion(unsavedQuestionIndex, questionsFormArray);
        expect(quizValidationServiceSpy.validateQuestion).toHaveBeenCalled();
        expect(service.extractQuestion).toHaveBeenCalled();
        expect(questionsFormArray.at(unsavedQuestionIndex).get('beingModified')?.value).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });

    it('should return an empty array and set beingModified to false for a valid question', () => {
        // the second question of this array is unsaved
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const unsavedQuestionIndex = 1;
        quizValidationServiceSpy.validateQuestion.and.returnValue(['Validation error']);
        spyOn(service, 'extractQuestion').and.returnValue(invalidQuestion);
        const result = service.saveQuestion(unsavedQuestionIndex, questionsFormArray);
        expect(quizValidationServiceSpy.validateQuestion).not.toHaveBeenCalled();
        expect(service.extractQuestion).not.toHaveBeenCalled();
        expect(questionsFormArray.at(unsavedQuestionIndex).get('beingModified')?.value).toBeFalsy();
        expect(result.length).toBe(0);
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

    it('should call swapElements with the correct arguments when moveQuestionUp or down', () => {
        const questionsFormArray = formQuestionsArrayAllSaved;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(1, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalledWith(questionToMoveUpIndex, questionToMoveUpIndex - 1, questionsFormArray);
        service.moveQuestionDown(0, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalledWith(0, 1, questionsFormArray);
    });

    it('should swap questions accordingly when moveQuestionUp is called', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const firstQuestionText = formQuestionsArrayOneUnsaved.at(0).get('text')?.value;
        const secondQuestionText = formQuestionsArrayOneUnsaved.at(1).get('text')?.value;
        service.modifiedQuestionIndex = 1;
        service.moveQuestionUp(1, questionsFormArray);
        expect(questionsFormArray.at(0).get('text')?.value).toEqual(secondQuestionText);
        expect(questionsFormArray.at(1).get('text')?.value).toEqual(firstQuestionText);
        expect(service.modifiedQuestionIndex).toBe(0);
    });

    it('should swap questions accordingly when moveQuestionDown is called', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        const firstQuestionText = formQuestionsArrayOneUnsaved.at(1).get('text')?.value;
        const secondQuestionText = formQuestionsArrayOneUnsaved.at(2).get('text')?.value;
        service.modifiedQuestionIndex = 1;
        service.moveQuestionDown(1, questionsFormArray);
        expect(questionsFormArray.at(1).get('text')?.value).toEqual(secondQuestionText);
        expect(questionsFormArray.at(2).get('text')?.value).toEqual(firstQuestionText);
        expect(service.modifiedQuestionIndex).toBe(2);
    });

    it('should change modifiedQuestionIndex when its equal to the index of the method moveQuestionUp or moveQuestionDown', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 1;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(questionToMoveUpIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(0);
        const questionToMoveDownIndex = 0;
        service.moveQuestionDown(questionToMoveDownIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(1);
    });

    it('should change modifiedQuestionIndex when the input index is not the modifiedQuestionIndex', () => {
        const questionsFormArray = formQuestionsArrayOneUnsaved;
        service.modifiedQuestionIndex = 0;
        const questionToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        service.moveQuestionUp(questionToMoveUpIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(1);
        const questionToMoveDownIndex = 0;
        service.moveQuestionDown(questionToMoveDownIndex, questionsFormArray);
        expect(service.modifiedQuestionIndex).toBe(0);
    });

    it('should call initChoice when adding a new Choice', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        spyOn(service, 'initChoice').and.returnValue(new FormGroup([]));
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        expect(service.initChoice).toHaveBeenCalled();
    });

    it('should add a choice to the specified question', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        const choicesArray = questionFormArray.at(questionIndex)?.get('choices') as FormArray;
        expect(choicesArray.length).toBe(3);
    });

    it('should not add a choice if choicesArray length exceeds the limit', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const questionFormArray = formQuestionsArrayAllSaved;
        // adds to four elements
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        service.addChoice(questionIndex, choiceIndex, questionFormArray);
        const choicesArray = questionFormArray.at(questionIndex)?.get('choices') as FormArray;
        expect(choicesArray.length).toBe(LENGTH_FOUR);
    });

    it('should call swapElements and getChoicesArray when moving choice up or down', () => {
        // Arrange
        const questionsFormArray = formQuestionsArrayAllSaved;
        const questionToModifyIndex = 0;
        const choiceToMoveUpIndex = 1;
        spyOn(service, 'swapElements');
        spyOn(service, 'getChoicesArray').and.returnValue(new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]));
        service.moveChoiceUp(questionToModifyIndex, choiceToMoveUpIndex, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalled();
        expect(service.getChoicesArray).toHaveBeenCalled();
        service.moveChoiceDown(questionToModifyIndex, 0, questionsFormArray);
        expect(service.swapElements).toHaveBeenCalled();
        expect(service.getChoicesArray).toHaveBeenCalled();
    });

    it('should move a choice up or move choice down within the specified question', () => {
        const questionIndex = 0;
        let choiceIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.moveChoiceUp(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.value).toEqual(['Choice 2', 'Choice 1']);
        choiceIndex = 0;
        service.moveChoiceDown(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 2']);
    });

    it('should remove a choice at a given index if number of choices is superior to two', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2'), new FormControl('Choice 3')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.removeChoice(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.length).toBe(2);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 3']);
    });

    it('should not remove a choice at a given index if number of choices is inferior to three', () => {
        const questionIndex = 0;
        const choiceIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: choicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        service.removeChoice(questionIndex, choiceIndex, questionFormArray);
        expect(choicesArray.length).toBe(2);
        expect(choicesArray.value).toEqual(['Choice 1', 'Choice 2']);
    });

    it('should return the choices array for a given index', () => {
        const questionIndex = 0;
        const initialChoicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        const questionFormGroup = new FormGroup({
            choices: initialChoicesArray,
        });
        const questionFormArray = new FormArray([questionFormGroup]);
        const choicesReturned = service.getChoicesArray(questionIndex, questionFormArray);
        expect(choicesReturned).toBeTruthy();
        expect(choicesReturned.value).toEqual(initialChoicesArray.value);
    });

    it('should return null if the form array is undefined', () => {
        const questionIndex = 0;
        const choicesArray = service.getChoicesArray(questionIndex);
        expect(choicesArray).toBeUndefined();
    });

    it('should swap two elements in the form array', () => {
        const firstIndex = 0;
        const secondIndex = 1;
        const choicesArray = new FormArray([new FormControl('Choice 1'), new FormControl('Choice 2')]);
        service.swapElements(firstIndex, secondIndex, choicesArray);

        const elementA = choicesArray.at(firstIndex).value;
        const elementB = choicesArray.at(secondIndex).value;

        expect(elementA).toBe('Choice 2');
        expect(elementB).toBe('Choice 1');
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
