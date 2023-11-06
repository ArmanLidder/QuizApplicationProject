import { Injectable } from '@angular/core';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { FormQuestion } from '@common/interfaces/quiz-form.interface';

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
