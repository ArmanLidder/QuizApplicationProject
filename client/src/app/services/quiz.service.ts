import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Quiz } from '@app/interfaces/quiz.interface';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGetAll(): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/quiz`).pipe(catchError(this.handleError<Quiz>('basicGetAll')));
    }

    basicGetALllVisible(): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/quiz/visible`).pipe(catchError(this.handleError<Quiz>('basicGetAllVisible')));
    }

    basicGetById(id: string): Observable<Quiz> {
        return this.http.get<Quiz>(`${this.baseUrl}/quiz/${id}`).pipe(catchError(this.handleError<Quiz>('basicGetById')));
    }

    basicPost(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/quiz/`, quiz, { observe: 'response', responseType: 'text' });
    }

    basicPut(quiz: Quiz): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/quiz/`, quiz, { observe: 'response', responseType: 'text' });
    }

    basicDelete(id: number) {
        this.http.delete(`${this.baseUrl}/quiz/${id}`);
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
