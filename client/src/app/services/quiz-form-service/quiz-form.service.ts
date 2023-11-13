import { Injectable } from '@angular/core';
import { Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuestionType } from '@common/enums/question-type.enum';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormQuestion } from '@common/interfaces/quiz-form.interface';
import { getCurrentDateService } from 'src/utils/current-date-format';
import { QuizValidationService } from '@app/services/quiz-validation.service/quiz-validation.service';

const MAX_POINTS_PER_QUESTION = 100;
const MIN_POINTS_PER_QUESTION = 10;
const MAX_QCM_DURATION = 60;
const MIN_QCM_DURATION = 10;
const MAX_NUMBER_OF_CHOICES_PER_QUESTION = 4;
const MIN_NUMBER_OF_CHOICES_PER_QUESTION = 2;
const MIN_NUMBER_OF_QUESTIONS = 1;

@Injectable({
    providedIn: 'root',
})
export class QuizFormService {
    questions: FormQuestion[] = [];
    quiz: Quiz;

    constructor(
        private fb: FormBuilder,
        private validationService: QuizValidationService,
    ) {}

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
                question?.type === QuestionType.QCM
                    ? [
                          Validators.minLength(MIN_NUMBER_OF_CHOICES_PER_QUESTION),
                          Validators.maxLength(MAX_NUMBER_OF_CHOICES_PER_QUESTION),
                          this.validationService.validateChoicesForm,
                      ]
                    : [],
            ),
            beingModified: question === undefined,
        });
        questionForm.get('type')?.valueChanges.subscribe((type: string | null) => {
            const choicesControl = questionForm.get('choices') as FormArray;
            if (type === 'QCM') {
                choicesControl.setValidators([
                    Validators.minLength(MIN_NUMBER_OF_CHOICES_PER_QUESTION),
                    Validators.maxLength(MAX_NUMBER_OF_CHOICES_PER_QUESTION),
                    this.validationService.validateChoicesForm,
                ]);
            } else {
                choicesControl.clearValidators();
                choicesControl.clear();
            }
            choicesControl?.updateValueAndValidity();
        });

        this.fillChoices(questionForm.get('choices') as FormArray, question?.choices);
        return questionForm;
    }

    extractQuestion(questionForm?: AbstractControl) {
        const question: QuizQuestion = {
            type: questionForm?.get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR,
            text: questionForm?.get('text')?.value,
            points: questionForm?.get('points')?.value,
            choices: questionForm?.get('type')?.value === 'QCM' ? [] : undefined,
        };
        questionForm?.get('choices')?.value?.forEach((choiceForm: QuizChoice) => {
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

    extractQuizFromForm(quizForm: FormGroup, questionsArray: FormArray) {
        const now = getCurrentDateService();
        const questions: QuizQuestion[] = [];
        questionsArray.controls.forEach((questionForm) => {
            const question: QuizQuestion = this.extractQuestionFromForm(questionForm as FormArray);
            questions.push(question);
        });

        const quiz: Quiz = {
            id: this.quiz?.id,
            title: quizForm.value.title,
            description: quizForm.value.description,
            duration: quizForm.value.duration,
            lastModification: now,
            questions,
            visible: quizForm.value.visible,
        };
        return quiz;
    }

    private extractQuestionFromForm(questionForm: FormArray): QuizQuestion {
        const question: QuizQuestion = {
            type: questionForm.get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR,
            text: questionForm.get('text')?.value,
            points: questionForm.get('points')?.value,
            choices: questionForm.get('type')?.value === 'QCM' ? [] : undefined,
        };
        (questionForm.get('choices') as FormArray).controls?.forEach((choiceForm) => {
            const choice = this.extractChoiceFromForm(choiceForm as FormArray);
            question.choices?.push(choice);
        });
        return question;
    }

    private extractChoiceFromForm(choiceForm: FormArray): QuizChoice {
        return {
            text: choiceForm.get('text')?.value,
            isCorrect: choiceForm.get('isCorrect')?.value === 'true',
        };
    }
}
