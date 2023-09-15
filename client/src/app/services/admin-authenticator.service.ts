import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AdminAuthenticatorService {
    password: string;

    isPasswordGood(): boolean {
        return this.password === 'admin';
    }
}
