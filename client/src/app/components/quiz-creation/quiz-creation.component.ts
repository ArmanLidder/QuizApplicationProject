import { Component, Injector } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { QuizCreationService } from '@app/services/quiz-creation.service';
import { QuizService } from '@app/services/quiz.service';
import { generateRandomId } from 'src/utils/random-id-generator';
import { getCurrentDateService } from 'src/utils/current-date-format';

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
    formErrors: string[] = [];
    quizCreationService: QuizCreationService;
    protected readonly pageModel = PageMode;
    private quizService: QuizService;
    private route: ActivatedRoute;
    private navigateRoute: Router;

    constructor(injector: Injector) {
        this.quizCreationService = injector.get<QuizCreationService>(QuizCreationService);
        this.quizService = injector.get<QuizService>(QuizService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.navigateRoute = injector.get<Router>(Router);

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

    showPopupIfFormConditionMet(condition: boolean) {
        if (condition) {
            this.isPopupVisibleForm = true;
            setTimeout(() => {
                this.isPopupVisibleForm = false;
            }, POPUP_TIMEOUT);
        }
        return condition;
    }

    extractQuizFromForm() {
        const now = getCurrentDateService();
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

        const quiz: Quiz = {
            id: this.quiz?.id,
            title: this.quizForm.value.title,
            description: this.quizForm.value.description,
            duration: this.quizForm.value.duration,
            lastModification: now,
            questions,
            visible: this.quizForm.value.visible,
        };
        return quiz;
    }

    addOrUpdateQuiz(quiz: Quiz) {
        const navigateToAdminCallBack = () => {
            this.navigateRoute.navigate(['/game-admin-page']);
        };
        if (this.mode === PageMode.MODIFICATION) {
            this.quizService.basicPut(quiz).subscribe(navigateToAdminCallBack);
        } else {
            quiz.id = generateRandomId();
            this.quizService.basicPost(quiz).subscribe(navigateToAdminCallBack);
        }
    }

    onSubmit() {
        const quiz = this.extractQuizFromForm();
        if (this.quizForm?.valid) {
            const title = this.quizForm.get('title')?.value;
            this.quizService.checkTitleUniqueness(title).subscribe((response) => {
                if (response.body?.isUnique || this.mode === PageMode.MODIFICATION) {
                    this.addOrUpdateQuiz(quiz);
                } else {
                    window.alert('Un quiz ayant le même titre existe déjà');
                }
            });
        } else {
            this.formErrors = this.quizCreationService.validateQuiz(quiz);
            this.showPopupIfFormConditionMet(true);
        }
    }
}
