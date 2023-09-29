import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { Observable } from 'rxjs';

export const authGuardAuthentification: CanActivateFn = (): Observable<boolean> => {
    return inject(AdminAuthenticatorService).validatePassword();
};
