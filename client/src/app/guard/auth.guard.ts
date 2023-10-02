import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { tap } from 'rxjs';
// comment
export const authGuardAuthentification = () => {
    const router = inject(Router);
    const authServices = inject(AdminAuthenticatorService);
    return authServices.validatePassword().pipe(
        tap((isValid) => {
            if (!isValid) router.navigate(['/game-admin-prompt']);
            return isValid;
        }),
    );
};
