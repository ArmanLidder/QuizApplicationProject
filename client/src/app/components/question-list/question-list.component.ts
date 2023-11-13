import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QuestionService } from '@app/services/question-service/question.service';
import { ChoiceService } from '@app/services/choice-service/choice.service';
import { POPUP_TIMEOUT } from '@app/components/question-list/question-list.component.const';
import { QuestionType } from '@common/enums/question-type.enum';

@Component({
    selector: 'app-question-list',
    templateUrl: './question-list.component.html',
    styleUrls: ['./question-list.component.scss'],
})
export class QuestionListComponent {
    @Input() questionsArray: FormArray | undefined;
    @Input() parentGroup: FormGroup;

    isPopupVisible: boolean = false;
    questionErrors: string[] = [];

    constructor(
        public questionService: QuestionService,
        public choiceService: ChoiceService,
    ) {}
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
        this.questionErrors = this.questionService.addQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    removeQuestion(index: number) {
        this.questionService.removeQuestion(index, this.questionsArray);
    }

    modifyQuestion(index: number) {
        this.questionErrors = this.questionService.modifyQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }
    saveQuestion(index: number) {
        this.questionErrors = this.questionService.saveQuestion(index, this.questionsArray);
        this.showPopupIfConditionMet(this.questionErrors.length !== 0);
    }

    moveQuestionUp(index: number) {
        this.questionService.moveQuestionUp(index, this.questionsArray);
    }

    moveQuestionDown(index: number) {
        this.questionService.moveQuestionDown(index, this.questionsArray);
    }

    moveChoiceUp(questionIndex: number, choiceIndex: number) {
        this.choiceService.moveChoiceUp(questionIndex, choiceIndex, this.questionsArray);
    }

    moveChoiceDown(questionIndex: number, choiceIndex: number) {
        this.choiceService.moveChoiceDown(questionIndex, choiceIndex, this.questionsArray);
    }

    addChoice(questionIndex: number, choiceIndex: number) {
        this.choiceService.addChoice(questionIndex, choiceIndex, this.questionsArray);
    }

    removeChoice(questionIndex: number, choiceIndex: number) {
        this.choiceService.removeChoice(questionIndex, choiceIndex, this.questionsArray);
    }
    getChoicesArray(index: number) {
        return this.choiceService.getChoicesArray(index, this.questionsArray);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly questionType = QuestionType;
}
