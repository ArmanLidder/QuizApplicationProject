import { Component, Input, OnInit, ViewChild, ElementRef, NgModule } from '@angular/core';
import { QuizService } from '@app/services/quiz.service';
import { QuizValidationService } from '@app/services/quiz-validation.service';
import { Quiz } from '@app/interfaces/quiz.interface';

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
    importedQuiz: Quiz | null;
    constructor(public quizServices: QuizService, public quizValidator: QuizValidationService ) {}

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
        const index = this.quizzes.findIndex((quiz) => quiz.id === id)
        this.quizzes.splice(index, 1);
    }

    selectFile(event: Event) {
        if (event.target instanceof HTMLInputElement && event.target !== undefined) {
            const selectedFile = event.target.files && event.target.files[0];
            if (selectedFile) {
                if (selectedFile.type === 'application/json') {
                    const fileReader = new FileReader();
                    fileReader.onload = (e) => {
                        try { this.importedQuiz = JSON.parse(e.target?.result as string) as Quiz; }
                        catch (error) { console.log(error) }
                    };
                    fileReader.readAsText(selectedFile)
                } 
            }
        }
    }
    
    uploadFile() {
        this.fileInput.nativeElement.click();
        if (this.importedQuiz !== null) {
            if (this.quizValidator.isValidQuizFormat(this.importedQuiz)) {
                console.log(this.importedQuiz);
                    this.quizServices.basicPost(this.importedQuiz).subscribe((res) => {
                        if(res.status === 201 && this.importedQuiz !== null) {
                            this.quizzes.push(this.importedQuiz)
                            this.importedQuiz = null;
                        }
                    });
            }
        }
    }
}
            
                    
