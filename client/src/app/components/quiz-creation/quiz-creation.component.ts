import { Component, Injector } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Quiz } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { generateRandomId } from 'src/utils/random-id-generator';
import { QuizFormService } from '@app/services/quiz-form-service/quiz-form.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { MatDialog } from '@angular/material/dialog';
import { QuizExistsDialogComponent } from '@app/components/quiz-exists-dialog/quiz-exists-dialog.component';
import { PageMode } from 'src/enums/page-mode.enum';

const POPUP_TIMEOUT = 3000;

@Component({
    selector: 'app-quiz-creation',
    templateUrl: './quiz-creation.component.html',
    styleUrls: ['./quiz-creation.component.scss'],
})
export class QuizCreationComponent {
    quizForm: FormGroup;
    quiz: Quiz;
    mode: PageMode;
    isPopupVisibleDuration: boolean;
    isPopupVisibleForm: boolean;
    formErrors: string[];
    quizFormService: QuizFormService;
    quizValidationService: QuizValidationService;
    protected readonly pageModel = PageMode;
    private quizService: QuizService;
    private route: ActivatedRoute;
    private navigateRoute: Router;

    constructor(
        injector: Injector,
        private dialog: MatDialog,
    ) {
        this.quizFormService = injector.get<QuizFormService>(QuizFormService);
        this.quizValidationService = injector.get<QuizValidationService>(QuizValidationService);
        this.quizService = injector.get<QuizService>(QuizService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.navigateRoute = injector.get<Router>(Router);
        this.isPopupVisibleDuration = false;
        this.isPopupVisibleForm = false;
        this.formErrors = [];
        this.quizForm = this.quizFormService.fillForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.mode = PageMode.MODIFICATION;
            this.quizService.basicGetById(id).subscribe((quiz: Quiz) => {
                this.quiz = quiz;
                this.quizForm = this.quizFormService.fillForm(quiz);
            });
        } else {
            this.mode = PageMode.CREATION;
            this.quizForm = this.quizFormService.fillForm();
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

    onSubmit() {
        const quiz = this.quizFormService.extractQuizFromForm(this.quizForm, this.questionsArray);
        if (this.quizForm?.valid) {
            const title = this.quizForm.get('title')?.value;
            this.quizService.checkTitleUniqueness(title).subscribe((response) => {
                if (response.body?.isUnique || this.mode === PageMode.MODIFICATION) {
                    this.addOrUpdateQuiz(quiz);
                } else {
                    this.openQuizExistsDialog();
                }
            });
        } else {
            this.formErrors = this.quizValidationService.validateQuiz(quiz);
            this.showPopupIfFormConditionMet(true);
        }
    }

    private addOrUpdateQuiz(quiz: Quiz) {
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

    private openQuizExistsDialog() {
        this.dialog.open(QuizExistsDialogComponent, {
            data: {
                title: 'Le titre existe déjà',
                content: 'Un quiz ayant le même titre existe déjà.',
            },
        });
    }
}
