import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        public authenticator: AdminAuthenticatorService,
        private router: Router,
    ) {}

    canActivate(): Observable<boolean> {
        return this.authenticator.authenticatePassword().pipe(
            map((authenticated: boolean) => {
                if (authenticated) {
                    return true;
                } else {
                    // If not authenticated, redirect to the login page (or any other route).
                    this.router.navigate(['/game-admin-prompt']);
                    return false;
                }
            }),
        );
    }
}
