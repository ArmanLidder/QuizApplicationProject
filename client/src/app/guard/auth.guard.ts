import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { map, Observable } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
class AuthGuard {
    constructor(public authenticator: AdminAuthenticatorService) {}

    canActivate(): Observable<boolean> {
        return this.authenticator.validatePassword();
    }
}

export const authGuardAuthentification: CanActivateFn = (): Observable<boolean> => {
    const router = new Router();
    const authGuard = inject(AuthGuard);
    return authGuard.canActivate().pipe(
        map((canActivate) => {
            if (!canActivate) {
                router.navigate(['/game-admin-prompt']);
            }
            return canActivate;
        }),
    );
};
