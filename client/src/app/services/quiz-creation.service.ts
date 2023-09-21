import { Injectable } from '@angular/core';
import { QuestionType, Quiz, QuizChoice } from '@app/interfaces/quiz.interface';
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

    addQuestion() {
        const newQuestion: FormQuestion = {
            type: QuestionType.QCM,
            text: '',
            points: 0,
            choices: [], // Add an empty choices array
            beingModified: false,
        };

        this.questions.push(newQuestion);
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
