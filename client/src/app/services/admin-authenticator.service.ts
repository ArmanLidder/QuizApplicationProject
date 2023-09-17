import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthenticatorService {
    password: string;
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    authentificatePassword(): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/api/auth/admin-password`, this.password, { observe: 'response', responseType: 'text' });
    }
}
