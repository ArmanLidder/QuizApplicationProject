import { Component, Input, OnInit, ViewChild, ElementRef, NgModule } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
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

    private asyncFileRead: Promise<void>;
    private asyncFileResolver: () => void;
    private asyncFileRejecter: (error: unknown) => void;

    quizzes: Quiz[];
    importedQuiz: Quiz | null;
    selectedQuiz: Quiz | null;

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

    removeQuiz(id: string) {
        const index = this.quizzes.findIndex((quiz) => quiz.id === id);
        this.quizzes.splice(index, 1);
    }

    selectFile(event: Event) {
        if (event.target instanceof HTMLInputElement && event.target !== undefined) {
            const selectedFile = event.target.files && event.target.files[0];
            if (selectedFile) if (selectedFile.type === 'application/json') this.readFile(selectedFile);
        }
    }

    uploadFile() {
        this.fileInput.nativeElement.click();
        this.asyncFileRead = this.waitForFileRead();
        this.asyncFileRead.then(() => {
            if (this.importedQuiz) {
                if (this.quizValidator.isValidQuizFormat(this.importedQuiz)) {
                    this.quizServices.basicPost(this.importedQuiz).subscribe((res) => {
                        if (res.status === CREATED) this.populateGameList();
                    });
                }
            }
        });
    }

    private readFile(selectedFile: File) {
        if (selectedFile.type === 'application/json') {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                try {
                    this.importedQuiz = JSON.parse(e.target?.result as string) as Quiz;
                    this.resolveasyncFileRead();
                } catch (error) {
                    this.rejectasyncFileRead(error);
                }
            };
            fileReader.readAsText(selectedFile);
        }
    }

    uploadFile() {
        this.fileInput.nativeElement.click();
        this.asyncFileRead = this.waitForFileRead();
        this.asyncFileRead.then(() => {
            if (this.importedQuiz) {
                if (this.quizValidator.isValidQuizFormat(this.importedQuiz)) {
                    this.quizServices.basicPost(this.importedQuiz).subscribe((res) => {
                        if (res.status === CREATED) this.populateGameList();
                    });
                }
            }
        });
    }

    selectQuiz(quiz: Quiz): void {
        this.selectedQuiz = quiz;
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
