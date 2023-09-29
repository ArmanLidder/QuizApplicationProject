import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';

export const authGuardAuthentification: CanActivateFn = (): Observable<boolean> => {
    return inject(AdminAuthenticatorService).validatePassword();
};
