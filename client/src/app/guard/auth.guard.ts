import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
// eslint-disable-next-line deprecation/deprecation
export class AuthGuard implements CanActivate {
    constructor(public authenticator: AdminAuthenticatorService) {}

    canActivate(): Observable<boolean> {
        return this.authenticator.validatePassword();
    }
}
