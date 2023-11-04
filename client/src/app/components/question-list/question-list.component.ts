import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QuizCreationService } from '@app/services/quiz-creation.service';
import {POPUP_TIMEOUT} from '@app/components/question-list/question-list.component.const';


@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent {
    @Input() questionsArray: FormArray | undefined;
    @Input() parentGroup: FormGroup;

    isPopupVisible: boolean = false;
    isButtonNotToggled: boolean = true;
    questionErrors: string[] = [];

    constructor(public quizCreationService: QuizCreationService) {}
    showPopupIfConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisible = true;
            setTimeout(() => {
                this.isPopupVisible = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    addQuestion(index: number) {
        this.questionErrors = this.quizCreationService.addQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    removeQuestion(index: number) {
        this.quizCreationService.removeQuestion(index, this.questionsArray);
    }

    modifyQuestion(index: number) {
        this.questionErrors = this.quizCreationService.modifyQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }
    saveQuestion(index: number) {
        this.questionErrors = this.quizCreationService.saveQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    moveQuestionUp(index: number) {
        this.quizCreationService.moveQuestionUp(index, this.questionsArray);
    }

    moveQuestionDown(index: number) {
        this.quizCreationService.moveQuestionDown(index, this.questionsArray);
    }

    moveChoiceUp(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.moveChoiceUp(questionIndex, choiceIndex, this.questionsArray);
    }

    moveChoiceDown(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.moveChoiceDown(questionIndex, choiceIndex, this.questionsArray);
    }

    addChoice(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.addChoice(questionIndex, choiceIndex, this.questionsArray);
    }

    removeChoice(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.removeChoice(questionIndex, choiceIndex, this.questionsArray);
    }
    getChoicesArray(index: number) {
        return this.quizCreationService.getChoicesArray(index, this.questionsArray);
    }
}
