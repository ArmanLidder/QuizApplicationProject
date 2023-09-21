import { Injectable } from '@angular/core';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@app/interfaces/quiz.interface';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

const nonExistantIndex = -1;
const maxPointsPerQuestion = 100;
const minPointsPerQuestion = 10;
const maxQcmDuration = 60;
const minQcmDuration = 10;
const maxNumberOfChoicesPerQuestion = 4;
const minNumberOfChoicesPerQuestion = 2;
const minNumberOfQuestions = 1;

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
    modifiedQuestionIndex: number = nonExistantIndex;

    constructor(private fb: FormBuilder) {}

    addQuestion(index: number, questionsFormArray?: FormArray) {
        const questionToAdd = this.initQuestion();
        if (questionsFormArray?.length === 0) {
            questionsFormArray?.push(questionToAdd);
            this.modifiedQuestionIndex = 0;
        } else {
            const questionSaved = this.saveQuestion(this.modifiedQuestionIndex, questionsFormArray);
            if (questionSaved) {
                questionsFormArray?.insert(index + 1, questionToAdd);
                this.modifiedQuestionIndex = index + 1;
            }
        }
    }

    removeQuestion(index: number, questionsFormArray?: FormArray) {
        if (questionsFormArray?.length && index === questionsFormArray?.length - 1 && this.modifiedQuestionIndex === index) {
            this.modifiedQuestionIndex = 0;
        } else if (this.modifiedQuestionIndex > index) {
            this.modifiedQuestionIndex--;
        }
        questionsFormArray?.removeAt(index);
    }

    modifyQuestion(index: number, questionFormArray?: FormArray) {
        if (index !== this.modifiedQuestionIndex) {
            const questionSaved = this.saveQuestion(this.modifiedQuestionIndex, questionFormArray);
            if (questionSaved) {
                this.modifiedQuestionIndex = index;
                questionFormArray?.at(index).patchValue({ beingModified: true });
            }
        } else {
            this.modifiedQuestionIndex = index;
            questionFormArray?.at(index).patchValue({ beingModified: true });
        }
    }

    saveQuestion(index: number, questionsFormArray?: FormArray): boolean {
        const questionToSave = questionsFormArray?.at(index);
        if (questionToSave?.valid) {
            questionsFormArray?.at(index).patchValue({ beingModified: false });
            return true;
        }
        return false;
    }

    addChoice(question: FormQuestion) {
        if (question.choices.length < 4) {
            const newChoice = {
                text: '',
                isCorrect: false,
            };
            question.choices.push(newChoice);
        }
    }

    fillForm(quiz?: Quiz) {
        const quizForm: FormGroup = this.fb.group({
            title: [quiz?.title, Validators.required],
            description: [quiz?.description, Validators.required],
            duration: [quiz?.duration, [Validators.required, Validators.min(minQcmDuration), Validators.max(maxQcmDuration)]],
            questions: this.fb.array([], [Validators.minLength(minNumberOfQuestions), Validators.required]),
        });
        this.fillQuestions(quizForm.get('questions') as FormArray, quiz?.questions);
        return quizForm;
    }

    addChoice(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        const choiceToAdd = this.initChoice();
        if (choicesArrayForm.length < maxNumberOfChoicesPerQuestion) {
            choicesArrayForm.insert(choiceIndex, choiceToAdd);
        }
    }

    addChoiceFirst(questionIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        const choiceToAdd = this.initChoice();
        choicesArrayForm.insert(0, choiceToAdd);
    }

    removeChoice(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        if (choicesArrayForm.length > minNumberOfChoicesPerQuestion) {
            choicesArrayForm.removeAt(choiceIndex);
        }
    }

    getChoicesArray(index: number, questionArrayForm?: FormArray) {
        const questionGroup = questionArrayForm?.at(index) as FormGroup;
        return questionGroup.get('choices') as FormArray;
    }
    
    private swapQuestions(firstIndex: number, secondIndex: number, questionsArrayForm?: FormArray) {
        const questionA = questionsArrayForm?.at(firstIndex) as FormGroup;
        const questionB = questionsArrayForm?.at(secondIndex) as FormGroup;
        questionsArrayForm?.setControl(firstIndex, questionB);
        questionsArrayForm?.setControl(secondIndex, questionA);
    }

    private fillQuestions(questionsFormArray: FormArray, quizQuestions?: QuizQuestion[]) {
        quizQuestions?.forEach((question) => {
            questionsFormArray.push(this.initQuestion(question));
        });
    }

    private initQuestion(question?: QuizQuestion): FormGroup {
        if (question) {
            const questionForm = this.fb.group({
                type: [question.type === QuestionType.QCM ? 'qcm' : 'qlr', Validators.required],
                text: [question.text, Validators.required],
                points: [question.points, [Validators.required, Validators.min(minPointsPerQuestion), Validators.max(maxPointsPerQuestion)]],
                choices: this.fb.array([], [Validators.minLength(minNumberOfChoicesPerQuestion), Validators.max(maxNumberOfChoicesPerQuestion)]),
                beingModified: false,
            });
            this.fillChoices(questionForm.get('choices') as FormArray, question?.choices);
            return questionForm;
        }
        return this.fb.group({
            type: [QuestionType.QCM, Validators.required],
            text: ['', Validators.required],
            points: [1, [Validators.required, Validators.min(minPointsPerQuestion), Validators.max(maxPointsPerQuestion)]],
            choices: this.fb.array([], [Validators.minLength(minNumberOfChoicesPerQuestion), Validators.max(maxNumberOfChoicesPerQuestion)]),
            beingModified: true,
        });
    }

    private fillChoices(choicesFormArray: FormArray, choices?: QuizChoice[]) {
        choices?.forEach((choice) => {
            choicesFormArray.push(this.initChoice(choice));
        });
    }

    // Initialize a new choice form group
    private initChoice(choice?: QuizChoice): FormGroup {
        return this.fb.group({
            text: [choice?.text, Validators.required],
            isCorrect: [choice?.isCorrect ?? false],
        });
    }
}
