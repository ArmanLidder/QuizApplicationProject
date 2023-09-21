import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Quiz } from '@app/interfaces/quiz.interface';
import { FileValidationService } from './file-validation.service';

@Injectable({
  providedIn: 'root'
})
export class QuizImportationService {
  private readonly baseUrl: string = environment.serverUrl;
  constructor(private http: HttpClient, private fileValidator: FileValidationService) { }
  
  uploadQuiz(file: File) {
    console.log(file)
    console.log('ok')
    const quiz = (this.fileValidator.isValidQuiz(file)) ? file as unknown as Quiz : file as unknown as undefined;
    console.log(quiz)
    if (quiz !== undefined) return this.http.post(`${this.baseUrl}/api/quiz`, { quiz });
    else throw new Error('File does not have the right format');
  }
}




