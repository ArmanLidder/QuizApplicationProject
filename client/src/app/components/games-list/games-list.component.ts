import { Component, Input, OnInit, ViewChild, ElementRef, NgModule } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { QuizCreationService } from '@app/services/quiz-creation.service';
import { Quiz } from '@app/interfaces/quiz.interface';

const CREATED = 201;

@Component({
    selector: 'app-games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit {
    @NgModule() importError: string | null;

    @Input() isAdmin: boolean;
    @Input() isImportError: boolean = false;

    @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

    quizzes: Quiz[];
    importedQuiz: Quiz;
    selectedQuiz: Quiz | null;

    private asyncFileRead: Promise<void>;
    private asyncFileResolver: () => void;
    private asyncFileRejecter: (error: unknown) => void;

    constructor(
        public quizServices: QuizService,
        public quizValidator: QuizValidationService,
        public quizCreationServices: QuizCreationService,
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

    removeQuiz(id: string) {
        const index = this.quizzes.findIndex((quiz) => quiz.id === id);
        this.quizzes.splice(index, 1);
    }

    selectFile(event: Event) {
        if (event.target instanceof HTMLInputElement && event.target !== undefined) {
            const selectedFile = event.target.files && event.target.files[0];
            if (selectedFile?.type === 'application/json') this.readFile(selectedFile);
        }
    }

    uploadFile() {
        this.fileInput.nativeElement.click();
        this.asyncFileRead = this.waitForFileRead();
        this.asyncFileRead.then(() => {
            if (this.quizValidator.isValidQuizFormat(this.importedQuiz)) {
                this.quizServices.checkTitleUniqueness(this.importedQuiz.title).subscribe((res) => {
                    if (res.body?.isUnique) {
                        try {
                            this.quizCreationServices.fillForm(this.importedQuiz);
                        } catch (error) {
                            window.alert(`Erreur lors de l'importation:\n" ${error}`);
                            return;
                        }
                        this.quizServices.basicPost(this.importedQuiz as Quiz).subscribe((response) => {
                            if (response.status === CREATED) this.populateGameList();
                        });
                    } else {
                        window.alert('Un quiz ayant le même titre existe déjà');
                    }
                });
            }
        });
    }

    // isGoodFormatAndUniqueQuiz() {
    //     const quiz = this.importedQuiz as Quiz;
    //     const isValidFormat = this.quizValidator.isValidQuizFormat(quiz);
    //     this.quizServices.checkTitleUniqueness(quiz.title).subscribe();
    //     console.log(isUnique);
    //     return isValidFormat && isUnique;
    // }

    selectQuiz(quiz: Quiz): void {
        this.selectedQuiz = quiz;
    }

    private readFile(selectedFile: File) {
        if (selectedFile.type === 'application/json') {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                try {
                    const currentDate = new Date();
                    this.importedQuiz = JSON.parse(e.target?.result as string) as Quiz;
                    this.importedQuiz.lastModification = currentDate.toDateString() + ' ' + currentDate.toTimeString();
                    this.resolveasyncFileRead();
                } catch (error) {
                    this.rejectasyncFileRead(error);
                }
            };
            fileReader.readAsText(selectedFile);
        }
    }

    private async waitForFileRead(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.asyncFileResolver = resolve;
            this.asyncFileRejecter = reject;
        });
    }

    private resolveasyncFileRead(): void {
        this.asyncFileResolver();
    }

    private rejectasyncFileRead(error: unknown): void {
        this.asyncFileRejecter(error);
    }
}
