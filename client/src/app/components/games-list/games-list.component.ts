import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { QuizCreationService } from '@app/services/quiz-creation.service';
import { Quiz } from '@app/interfaces/quiz.interface';
import { generateRandomId } from 'src/utils/random-id-generator';
import { getCurrentDateService } from 'src/utils/current-date-format';

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

    quizzes: Quiz[];
    importedQuiz: Quiz;
    selectedQuiz: Quiz | null;
    asyncFileRead: Promise<void>;
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

    selectQuiz(quiz: Quiz): void {
        this.selectedQuiz = quiz;
    }

    selectFile(event: Event) {
        if (event.target instanceof HTMLInputElement && event.target !== undefined) {
            const selectedFile = event.target.files && event.target.files[0];
            if (selectedFile?.type === 'application/json') this.readFile(selectedFile);
            else window.alert('Erreur: Le format de fichier accepter est JSON');
        }
    }

    async uploadFile() {
        this.fileInput.nativeElement.click();
        await this.waitForFileRead();
        this.validateFileData();
    }

    private readFile(selectedFile: File) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.extractQuizData(e);
        };
        fileReader.readAsText(selectedFile);
    }

    private extractQuizData(event: ProgressEvent<FileReader>) {
        try {
            this.importedQuiz = JSON.parse(event.target?.result as string);
            this.importedQuiz.lastModification = getCurrentDateService();
            this.resolveasyncFileRead();
        } catch (error) {
            this.rejectasyncFileRead(error);
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

    private validateFileData() {
        const errors = this.quizValidator.validateQuiz(this.importedQuiz);
        if (errors.length === 0) {
            this.checkQuizNameUnique();
        } else {
            this.displayValidatorError(errors);
        }
    }

    private displayValidatorError(errors: string[]) {
        let index = 0;
        const isPlural = errors.length >= 1;
        const endSentence = isPlural ? 'les problèmes suivants' : 'le problème suivant';
        let errorMessage = `Le fichier que vous tenter d'importer contient ${endSentence} : `;
        errors.forEach((error) => {
            errorMessage += `\n${(index += 1)}- ${error}`;
        });
        errorMessage += '\n Veuillez corrigez cela avant de réessayer.';
        window.alert(errorMessage);
    }

    private checkQuizNameUnique() {
        this.quizServices.checkTitleUniqueness(this.importedQuiz.title).subscribe((res) => {
            if (!res.body?.isUnique) {
                this.promptQuizName();
                this.checkQuizNameUnique();
            } else {
                this.importedQuiz.id = generateRandomId();
                this.addImportedQuiz();
            }
        });
    }

    private promptQuizName() {
        const nouveauNom = window.prompt(`Un quiz nommé ${this.importedQuiz.title} existe déjà!\nVeuillez changer le nom du quiz.`);
        if (nouveauNom === '') window.prompt("Le titre d'un quiz ne peut pas être vide");
        else this.importedQuiz.title = nouveauNom === null ? this.importedQuiz.title : nouveauNom;
    }

    private addImportedQuiz() {
        this.quizServices.basicPost(this.importedQuiz as Quiz).subscribe((response) => {
            if (response.status === CREATED) this.populateGameList();
        });
    }
}
