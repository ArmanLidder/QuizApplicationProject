import { inject, Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
// eslint-disable-next-line deprecation/deprecation
class AuthGuard {
    constructor(public authenticator: AdminAuthenticatorService) {}

    canActivate(): Observable<boolean> {
        return this.authenticator.validatePassword();
    }
}

export const authGuardAuthentification : CanActivateFn = () : Observable<boolean> => {
    return inject(AuthGuard).canActivate();
}