import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthenticatorService {
    password: string;
    isValid: boolean;
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    authenticatePassword(): Observable<boolean> {
        return this.http.post(`${this.baseUrl}/auth/admin-password`, { password: this.password }, { observe: 'response', responseType: 'text' }).pipe(
            map((res: HttpResponse<unknown>) => {
                return res.status === 200;
            }),
            catchError(() => {
                return of(false);
            }),
        );
    }
}
