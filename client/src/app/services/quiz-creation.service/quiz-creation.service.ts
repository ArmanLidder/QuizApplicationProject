import { Injectable } from '@angular/core';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';
import {
    MAX_POINTS_PER_QUESTION,
    MIN_POINTS_PER_QUESTION,
    MAX_QCM_DURATION,
    MIN_QCM_DURATION,
    MAX_NUMBER_OF_CHOICES_PER_QUESTION,
    MIN_NUMBER_OF_CHOICES_PER_QUESTION,
    MIN_NUMBER_OF_QUESTIONS,
    NON_EXISTANT_INDEX,
} from '@app/services/quiz-creation.service/quiz-creation.service.const';

export interface FormChoice {
    text: string;
    isCorrect: boolean;
}

export interface FormQuestion {
    type: QuestionType;
    text: string;
    points: number;
    choices: FormChoice[];
    beingModified: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class QuizCreationService {
    questions: FormQuestion[] = [];
    quiz: Quiz;
    modifiedQuestionIndex: number = NON_EXISTANT_INDEX;

    constructor(
        private fb: FormBuilder,
        private validationService: QuizValidationService,
    ) {}

    validateQuiz(quiz: Quiz) {
        return this.validationService.validateQuiz(quiz);
    }

    addQuestion(index: number, questionsFormArray?: FormArray) {
        if (this.modifiedQuestionIndex !== NON_EXISTANT_INDEX) {
            const validationErrors = this.saveQuestion(this.modifiedQuestionIndex, questionsFormArray);
            if (validationErrors.length !== 0) {
                return validationErrors;
            }
        }
        const newQuestion = this.initQuestion();
        questionsFormArray?.insert(index + 1, newQuestion);
        this.modifiedQuestionIndex = index + 1;
        return [];
    }

    removeQuestion(index: number, questionsFormArray?: FormArray) {
        if (index === this.modifiedQuestionIndex) {
            this.modifiedQuestionIndex = -1;
        } else if (index < this.modifiedQuestionIndex) {
            this.modifiedQuestionIndex--;
        }
        questionsFormArray?.removeAt(index);
    }

    modifyQuestion(index: number, questionFormArray?: FormArray) {
        if (this.modifiedQuestionIndex !== NON_EXISTANT_INDEX) {
            const validationErrors = this.saveQuestion(this.modifiedQuestionIndex, questionFormArray);
            if (validationErrors.length !== 0) {
                return validationErrors;
            }
        }
        questionFormArray?.at(index).patchValue({ beingModified: true });
        this.modifiedQuestionIndex = index;
        return [];
    }

    saveQuestion(index: number, questionsFormArray?: FormArray): string[] {
        const questionToSave = questionsFormArray?.at(index);
        if (questionToSave?.valid) {
            questionsFormArray?.at(index).patchValue({ beingModified: false });
            return [];
        }
        const question = this.extractQuestion(questionToSave);
        return this.validationService.validateQuestion(question, index);
    }

    fillForm(quiz?: Quiz) {
        const quizForm: FormGroup = this.fb.group({
            title: [quiz?.title, Validators.required],
            duration: [quiz?.duration, [Validators.required, Validators.min(MIN_QCM_DURATION), Validators.max(MAX_QCM_DURATION)]],
            description: [quiz?.description, Validators.required],
            questions: this.fb.array([], [Validators.minLength(MIN_NUMBER_OF_QUESTIONS), Validators.required]),
            visible: [quiz?.visible],
        });
        this.fillQuestions(quizForm.get('questions') as FormArray, quiz?.questions);
        return quizForm;
    }

    moveQuestionUp(index: number, questionsFormArray?: FormArray) {
        this.swapElements(index, index - 1, questionsFormArray);
        if (this.modifiedQuestionIndex === index) {
            this.modifiedQuestionIndex--;
        } else if (this.modifiedQuestionIndex === index - 1) {
            this.modifiedQuestionIndex = index;
        }
    }

    moveQuestionDown(index: number, questionsFormArray?: FormArray) {
        this.swapElements(index, index + 1, questionsFormArray);
        if (this.modifiedQuestionIndex === index) {
            this.modifiedQuestionIndex++;
        } else if (this.modifiedQuestionIndex === index + 1) {
            this.modifiedQuestionIndex = index;
        }
    }

    addChoice(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        const choiceToAdd = this.initChoice();
        if (choicesArrayForm.length < MAX_NUMBER_OF_CHOICES_PER_QUESTION) {
            choicesArrayForm.insert(choiceIndex + 1, choiceToAdd);
        }
    }

    moveChoiceUp(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const choicesArray = this.getChoicesArray(questionIndex, questionFormArray);
        this.swapElements(choiceIndex, choiceIndex - 1, choicesArray);
    }

    moveChoiceDown(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const choicesArray = this.getChoicesArray(questionIndex, questionFormArray);
        this.swapElements(choiceIndex, choiceIndex + 1, choicesArray);
    }

    removeChoice(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        if (choicesArrayForm.length > MIN_NUMBER_OF_CHOICES_PER_QUESTION) {
            choicesArrayForm.removeAt(choiceIndex);
        }
    }

    getChoicesArray(index: number, questionArrayForm?: FormArray) {
        const questionGroup = questionArrayForm?.at(index) as FormGroup;
        return questionGroup?.get('choices') as FormArray;
    }

    swapElements(firstIndex: number, secondIndex: number, arrayForm?: FormArray) {
        const elementA = arrayForm?.at(firstIndex) as FormGroup;
        const elementB = arrayForm?.at(secondIndex) as FormGroup;
        arrayForm?.setControl(firstIndex, elementB);
        arrayForm?.setControl(secondIndex, elementA);
    }

    fillQuestions(questionsFormArray: FormArray, quizQuestions?: QuizQuestion[]) {
        quizQuestions?.forEach((question) => {
            questionsFormArray.push(this.initQuestion(question));
        });
    }

    initQuestion(question?: QuizQuestion): FormGroup {
        const questionForm = this.fb.group({
            type: [question?.type === QuestionType.QCM ? 'QCM' : 'QLR', Validators.required],
            text: [question?.text ?? '', Validators.required],
            points: [
                question?.points ?? 0,
                [
                    Validators.required,
                    Validators.min(MIN_POINTS_PER_QUESTION),
                    Validators.max(MAX_POINTS_PER_QUESTION),
                    this.validationService.divisibleByTen,
                ],
            ],
            choices: this.fb.array(
                [],
                [
                    Validators.minLength(MIN_NUMBER_OF_CHOICES_PER_QUESTION),
                    Validators.maxLength(MAX_NUMBER_OF_CHOICES_PER_QUESTION),
                    this.validationService.validateChoicesForm,
                ],
            ),
            beingModified: question === undefined,
        });
        this.fillChoices(questionForm.get('choices') as FormArray, question?.choices);
        return questionForm;
    }

    extractQuestion(questionForm?: AbstractControl) {
        const question: QuizQuestion = {
            type: questionForm?.get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR,
            text: questionForm?.get('text')?.value,
            points: questionForm?.get('points')?.value,
            choices: [],
        };
        questionForm?.get('choices')?.value.forEach((choiceForm: QuizChoice) => {
            const choice: QuizChoice = {
                text: choiceForm.text,
                isCorrect: choiceForm.isCorrect,
            };
            question.choices?.push(choice);
        });
        return question;
    }

    fillChoices(choicesFormArray: FormArray, choices?: QuizChoice[]) {
        choices?.forEach((choice) => {
            choicesFormArray.push(this.initChoice(choice));
        });
    }

    initChoice(choice?: QuizChoice): FormGroup {
        return this.fb.group({
            text: [choice?.text, Validators.required],
            isCorrect: [choice?.isCorrect ? 'true' : 'false'],
        });
    }
}
