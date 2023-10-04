import { Component, Input, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { Quiz } from '@common/interfaces/quiz.interface';
import { generateRandomId } from 'src/utils/random-id-generator';
import { getCurrentDateService } from 'src/utils/current-date-format';
import { Router } from '@angular/router';
const CREATED = 201;

@Component({
    selector: 'app-games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit {
    @Input() isAdmin: boolean;
    @Input() isImportError: boolean = false;
    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
    router = inject(Router);
    quizzes: Quiz[] = [];
    importedQuiz: Quiz;
    selectedQuiz: Quiz | null;
    errors: string | null = null;
    isErrors: boolean = false;
    isQuizUnique: boolean = true;
    fileReader: FileReader = new FileReader();

    asyncFileResolver: () => void;
    asyncFileRejecter: (error: unknown) => void;

    constructor(
        public quizServices: QuizService,
        public quizValidator: QuizValidationService,
    ) {}

    ngOnInit() {
        this.populateGameList();
    }

    populateGameList() {
        if (this.isAdmin) this.getAllQuizzes();
        else this.getAllVisibleQuizzes();
    }

    getAllQuizzes() {
        this.quizServices.basicGetAll().subscribe((res) => {
            this.quizzes = res;
        });
    }

    getAllVisibleQuizzes() {
        this.quizServices.basicGetAllVisible().subscribe((res) => {
            this.quizzes = res;
        });
    }

    updateVisibility(quiz: Quiz) {
        this.quizServices.basicPatch(quiz.id, !quiz.visible).subscribe();
    }

    killErrorFeedback(value: boolean) {
        this.isQuizUnique = value;
        this.isErrors = !value;
        this.errors = null;
    }

    receiveQuizName(newName: string) {
        this.importedQuiz.title = newName;
        this.checkQuizNameUnique();
        this.isQuizUnique = true;
    }

    removeQuiz(id: string) {
        const index = this.quizzes.findIndex((quiz) => quiz.id === id);
        this.quizzes.splice(index, 1);
    }

    selectQuiz(quiz: Quiz): void {
        this.selectedQuiz = quiz;
    }

    selectFile(event: Event) {
        if (event.target instanceof HTMLInputElement) {
            const selectedFile = event.target.files && event.target.files[0];
            if (selectedFile?.type === 'application/json') this.readFile(selectedFile);
            event.target.value = '';
        }
    }

    async uploadFile() {
        this.fileInput.nativeElement.click();
        await this.waitForFileRead();
        this.validateFileData();
    }

    readFile(selectedFile: File) {
        this.fileReader.readAsText(selectedFile);
        this.fileReader.onload = (e) => this.extractQuizData(e);
    }

    extractQuizData(event: ProgressEvent<FileReader>) {
        try {
            this.importedQuiz = JSON.parse(event.target?.result as string);
            this.importedQuiz.lastModification = getCurrentDateService();
            this.resolveasyncFileRead();
        } catch (error) {
            this.rejectasyncFileRead(error);
        }
    }

    async waitForFileRead(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.asyncFileResolver = resolve;
            this.asyncFileRejecter = reject;
        });
    }

    resolveasyncFileRead(): void {
        this.asyncFileResolver();
    }

    rejectasyncFileRead(error: unknown): void {
        this.asyncFileRejecter(error);
    }

    validateFileData() {
        const errors = this.quizValidator.validateQuiz(this.importedQuiz);
        if (errors.length === 0) {
            this.checkQuizNameUnique();
        } else {
            this.errors = this.setValidatorError(errors);
            this.isErrors = true;
        }
    }

    setValidatorError(errors: string[]) {
        let index = 0;
        const isPlural = errors.length > 1;
        const endSentence = isPlural ? 'les problèmes suivants' : 'le problème suivant';
        let errorMessage = `Le fichier que vous tenter d'importer contient ${endSentence} :\n\n `;
        errors.forEach((error) => {
            errorMessage += `\n${(index += 1)}- ${error}\n`;
        });
        errorMessage += '\n\n Veuillez corriger cela avant de réessayer.';
        return errorMessage;
    }

    checkQuizNameUnique() {
        this.quizServices.checkTitleUniqueness(this.importedQuiz.title).subscribe((res) => {
            this.treatResponse(res.body?.isUnique as boolean);
        });
    }

    treatResponse(value: boolean) {
        if (!value) {
            this.isQuizUnique = false;
        } else {
            this.importedQuiz.id = generateRandomId();
            this.addImportedQuiz();
        }
    }

    addImportedQuiz() {
        this.quizServices.basicPost(this.importedQuiz as Quiz).subscribe((res) => {
            if (res.status === CREATED) this.populateGameList();
        });
    }

    handleQuizAction(route: string) {
        this.populateGameList();

        if (!this.selectedQuiz) return;

        this.quizServices.basicGetById(this.selectedQuiz.id).subscribe((res) => {
            this.selectedQuiz = null;

            if (res === null) {
                window.alert('Ce quiz a été supprimé, veuillez choisir un autre.');
            } else if (res.visible) {
                this.router.navigate([route, res.id]);
            } else {
                window.alert('Ce quiz est maintenant caché, veuillez choisir un autre.');
            }
        });
    }

    testGame() {
        this.handleQuizAction('/quiz-testing-page/');
    }

    playGame() {
        this.handleQuizAction('/waiting-room-page/');
    }
}
