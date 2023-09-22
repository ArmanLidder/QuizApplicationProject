import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz, QuizChoice, QuizQuestion } from '@app/interfaces/quiz.interface';
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

    constructor(
        public quizCreationService: QuizCreationService,
        private readonly quizService: QuizService,
        private route: ActivatedRoute,
        private navigateRoute: Router,
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

    // TODO: change it so that it works with reactive forms
    onSubmit() {
        if (this.quizForm?.valid) {
            const now = new Date();
            const questions: QuizQuestion[] = [];
            this.questionsArray.controls.forEach((questionForm) => {
                const question: QuizQuestion = {
                    type: questionForm.get('type')?.value,
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
            if (this.mode === PageMode.MODIFICATION) {
                this.quizService.basicPut(createdQuiz).subscribe();
            } else {
                createdQuiz.id = generateRandomId();
                this.quizService.basicPost(createdQuiz).subscribe();
            }
            this.navigateRoute.navigate(['/']);
        } else {
            this.showPopupIfFormConditionMet(true);
            // eslint-disable-next-line no-console
            console.log('Form is invalid!');
        }
    }
}
