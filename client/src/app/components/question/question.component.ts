import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormChoice, QuizCreationService } from '@app/services/quiz-creation.service';

const maxPointsPerQuestion = 100;
const minPointsPerQuestion = 10;
const divider = 10;
const POPUP_TIMEOUT = 3000;
const maxNumberOfChoicesPerQuestion = 4;
const minNumberOfChoicesPerQuestion = 2;
const NON_EXISTANT_INDEX = -1;

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() questionsArray: FormArray | undefined;
    @Input() parentGroup: FormGroup;

    isPopupVisible: boolean = false;
    isPopupVisiblePoints: boolean = false;
    isButtonNotToggled: boolean = true;
    isPopupVisibleChoices: boolean = false;

    constructor(public quizCreationService: QuizCreationService) {}

    getQuestionControl(index: number) {
        return (this.parentGroup.get('questions') as FormArray)?.at(index);
    }

    getQuestionPoint(index: number) {
        return this.getQuestionControl(index).value.points;
    }

    getQuestionChoices(indexQuestion: number): FormChoice[] {
        return this.getQuestionControl(indexQuestion).value.choices;
    }

    showPopupIfConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisible = true;
            setTimeout(() => {
                this.isPopupVisible = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    showPopupIfConditionMetPoints(condition: boolean) {
        if (condition) {
            this.isPopupVisiblePoints = true;
            setTimeout(() => {
                this.isPopupVisiblePoints = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    verifyConditionChoices(indexQuestion: number) {
        let counter = 0;
        const choices = this.getQuestionChoices(indexQuestion);
        choices.forEach((choice: any) => {
            if (choice.isCorrect === 'true') {
                ++counter;
            }
        });
        return 1 <= counter && counter < choices.length;
    }

    showPopupIfConditionMetChoice(condition: boolean) {
        if (condition) {
            this.isPopupVisibleChoices = true;
            setTimeout(() => {
                this.isPopupVisibleChoices = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    addQuestion(index: number) {
        if (!this.questionsArray?.at(this.quizCreationService.modifiedQuestionIndex).get('beingModified')) {
            this.showPopupIfConditionMet(true);
            this.quizCreationService.addQuestion(index, this.questionsArray);
        } else if (index !== this.quizCreationService.modifiedQuestionIndex) {
            if (this.conditionValidatorQCM(this.quizCreationService.modifiedQuestionIndex)) {
                this.showPopupIfConditionMet(true);
                this.quizCreationService.addQuestion(index, this.questionsArray);
            } else {
                this.showPopupIfConditionMet(false);
            }
        } else if (this.conditionValidatorQCM(index)) {
            this.showPopupIfConditionMet(true);
            this.quizCreationService.addQuestion(index, this.questionsArray);
        } else {
            this.showPopupIfConditionMet(false);
        }
    }

    removeQuestion(index: number) {
        this.quizCreationService.removeQuestion(index, this.questionsArray);
    }

    modifyQuestion(index: number) {
        if (this.quizCreationService.modifiedQuestionIndex === NON_EXISTANT_INDEX || index === this.quizCreationService.modifiedQuestionIndex) {
            this.quizCreationService.modifyQuestion(index, this.questionsArray);
        } else if (
            this.quizCreationService.modifiedQuestionIndex === NON_EXISTANT_INDEX ||
            (this.questionsArray?.at(this.quizCreationService.modifiedQuestionIndex).get('beingModified') &&
                this.saveQuestion(this.quizCreationService.modifiedQuestionIndex))
        ) {
            this.quizCreationService.modifyQuestion(index, this.questionsArray);
            this.showPopupIfConditionMet(true);
        } else {
            this.showPopupIfConditionMet(false);
        }
    }

    saveQuestion(index: number) {
        if (this.conditionValidatorQCM(index)) {
            return this.quizCreationService.saveQuestion(index, this.questionsArray);
        }
        return false;
    }

    moveQuestionUp(index: number) {
        this.quizCreationService.moveQuestionUp(index, this.questionsArray);
    }

    moveQuestionDown(index: number) {
        this.quizCreationService.moveQuestionDown(index, this.questionsArray);
    }

    addChoice(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.addChoice(questionIndex, choiceIndex, this.questionsArray);
    }

    addChoiceFirst(questionIndex: number) {
        this.isButtonNotToggled = false;
        this.quizCreationService.addChoiceFirst(questionIndex, this.questionsArray);
    }

    removeChoice(questionIndex: number, choiceIndex: number) {
        this.quizCreationService.removeChoice(questionIndex, choiceIndex, this.questionsArray);
    }
    getChoicesArray(index: number) {
        return this.quizCreationService.getChoicesArray(index, this.questionsArray);
    }

    conditionValidatorQCM(index: number) {
        if (this.getQuestionControl(index)?.get('text')?.invalid) {
            this.showPopupIfConditionMet(true);
            return false;
        } else if (
            this.getQuestionPoint(index) <= maxPointsPerQuestion &&
            minPointsPerQuestion <= this.getQuestionPoint(index) &&
            this.getQuestionPoint(index) % divider === 0
        ) {
            if (
                minNumberOfChoicesPerQuestion <= this.getQuestionChoices(index).length &&
                this.getQuestionChoices(index).length <= maxNumberOfChoicesPerQuestion
            ) {
                if (this.verifyConditionChoices(index)) {
                    return true;
                } else {
                    this.showPopupIfConditionMetChoice(true);
                    return false;
                }
            } else {
                this.showPopupIfConditionMetChoice(true);
                return false;
            }
        } else {
            this.showPopupIfConditionMetPoints(true);
            return false;
        }
    }
}
