import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';

const MAX_NUMBER_OF_CHOICES = 4;
const MIN_NUMBER_OF_CHOICES = 2;

@Injectable({
    providedIn: 'root',
})
export class ChoiceService {
    constructor(private quizFormService: QuizFormService) {}
    addChoice(questionIndex: number, choiceIndex: number, questionFormArray?: FormArray) {
        const questionGroup = questionFormArray?.at(questionIndex) as FormGroup;
        const choicesArrayForm = questionGroup.get('choices') as FormArray;
        const choiceToAdd = this.quizFormService.initChoice();
        if (choicesArrayForm.length < MAX_NUMBER_OF_CHOICES) {
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
        if (choicesArrayForm.length > MIN_NUMBER_OF_CHOICES) {
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
}
