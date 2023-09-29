import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('AuthGuard', () => {
    let authServiceSpy: SpyObj<AdminAuthenticatorService>;
    let component: AuthGuard;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('authServiceSpy', { validatePassword: of(Boolean) });
        authServiceSpy.validatePassword.and.returnValue(of(true));
    });
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            providers: [{ provide: AdminAuthenticatorService, useValue: authServiceSpy }],
        }).compileComponents();

        component = TestBed.inject(AuthGuard);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('can activate should call authservice validatePassword method', () => {
        component.canActivate();
        expect(authServiceSpy.validatePassword).toHaveBeenCalled();
    });
});
