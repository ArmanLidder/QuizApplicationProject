import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@app/interfaces/quiz.interface';
import { QuizCreationService } from '@app/services/quiz-creation.service';
import { QuizService } from '@app/services/quiz.service';
import { generateRandomId } from 'src/utils/random-id-generator';

const POPUP_TIMEOUT = 3000;

export enum PageMode {
    CREATION,
    MODIFICATION,
}
@Component({
    selector: 'app-quiz-creation',
    templateUrl: './quiz-creation.component.html',
    styleUrls: ['./quiz-creation.component.scss'],
})
export class QuizCreationComponent {
    quizForm: FormGroup;
    quiz: Quiz;
    mode: PageMode;
    isPopupVisibleDuration: boolean = false;
    isPopupVisibleForm: boolean = false;

    protected readonly pageModel = PageMode;
    /* eslint-disable max-params*/
    constructor(
        public quizCreationService: QuizCreationService,
        private readonly quizService: QuizService,
        private route: ActivatedRoute,
        private navigateRoute: Router /* eslint-disable max-params*/,
    ) {
        this.quizForm = this.quizCreationService.fillForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode = PageMode.MODIFICATION;
            this.quizService.basicGetById(id).subscribe((quiz: Quiz) => {
                this.quiz = quiz;
                this.quizForm = this.quizCreationService.fillForm(quiz);
            });
        } else {
            this.mode = PageMode.CREATION;
            this.quizForm = this.quizCreationService.fillForm();
        }
    }

    get questionsArray() {
        return this.quizForm.get('questions') as FormArray;
    }

    showPopupIfDurationConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisibleDuration = true;
            setTimeout(() => {
                this.isPopupVisibleDuration = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    showPopupIfFormConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisibleForm = true;
            setTimeout(() => {
                this.isPopupVisibleForm = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    onSubmit() {
        if (this.quizForm?.valid) {
            const title = this.quizForm.get('title')?.value;
            this.quizService.checkTitleUniqueness(title).subscribe((response) => {
                if (response.body?.isUnique || this.mode === PageMode.MODIFICATION) {
                    const now = new Date();
                    const questions: QuizQuestion[] = [];
                    this.questionsArray.controls.forEach((questionForm) => {
                        const question: QuizQuestion = {
                            type: questionForm.get('type')?.value === 'QCM' ? QuestionType.QCM : QuestionType.QLR,
                            text: questionForm.get('text')?.value,
                            points: questionForm.get('points')?.value,
                            choices: [],
                        };
                        (questionForm.get('choices') as FormArray).controls.forEach((choiceForm) => {
                            const choice: QuizChoice = {
                                text: choiceForm.get('text')?.value,
                                isCorrect: choiceForm.get('isCorrect')?.value === 'true',
                            };
                            question.choices?.push(choice);
                        });
                        questions.push(question);
                    });

                    const createdQuiz: Quiz = {
                        id: this.quiz?.id,
                        title: this.quizForm.value.title,
                        description: this.quizForm.value.description,
                        duration: this.quizForm.value.duration,
                        lastModification: now.toString(),
                        questions,
                        visible: false,
                    };
                    const navigateToAdminCallBack = () => {
                        this.navigateRoute.navigate(['/game-admin-page']);
                    };

                    if (this.mode === PageMode.MODIFICATION) {
                        this.quizService.basicPut(createdQuiz).subscribe(navigateToAdminCallBack);
                    } else {
                        createdQuiz.id = generateRandomId();
                        this.quizService.basicPost(createdQuiz).subscribe(navigateToAdminCallBack);
                    }
                    // this.navigateRoute.navigate(['game-admin-page']);
                } else {
                    window.alert('The quiz name that you entered already exists');
                }
            });
        } else {
            this.showPopupIfFormConditionMet(true);
        }
    }
}
