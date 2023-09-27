import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
import { PasswordPromptComponent } from './password-prompt.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import SpyObj = jasmine.SpyObj;

describe('PasswordPromptComponent', () => {
    let authServiceSpy: SpyObj<AdminAuthenticatorService>;
    let router: Router;
    let component: PasswordPromptComponent;
    let fixture: ComponentFixture<PasswordPromptComponent>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('authServiceSpy', { validatePassword: of(Boolean) });
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [PasswordPromptComponent],
            imports: [HttpClientModule, FormsModule, RouterTestingModule.withRoutes([])],
            providers: [{ provide: AdminAuthenticatorService, useValue: authServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PasswordPromptComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should try to navigate to /home when cancel button is clicked', () => {
        const cancelButton = fixture.debugElement.nativeElement.querySelector('.cancel');
        const navigateSpy = spyOn(router, 'navigateByUrl');
        cancelButton.click();
        expect(navigateSpy.calls.mostRecent().args[0].toString()).toEqual('/home');
    });

    it('should try to navigate to /game-admin-page when enter button is clicked', () => {
        const cancelButton = fixture.debugElement.nativeElement.querySelector('.enter');
        const navigateSpy = spyOn(router, 'navigateByUrl');
        cancelButton.click();
        expect(navigateSpy.calls.mostRecent().args[0].toString()).toEqual('/game-admin-page');
    });

    it('should set loginStatus to success message on successful validation', () => {
        authServiceSpy.validatePassword.and.returnValue(of(true));
        component.updateStatus();
        expect(component.loginStatus).toBe(null);
        expect(component.inputBorderColor).toEqual('');
        expect(component.textColor).toEqual('');
    });

    it('should set loginStatus to error message on failed validation', () => {
        authServiceSpy.validatePassword.and.returnValue(of(false));
        component.updateStatus();
        expect(component.loginStatus).toBe(component.errorMessage);
    });

    it('should set different text and border colors to indicate an error', () => {
        authServiceSpy.validatePassword.and.returnValue(of(false));
        component.updateStatus();
        expect(component.textColor).toBe('red-text');
        expect(component.inputBorderColor).toBe('red-border');
    });

    it('should start password validation when user press enter key on keyboard', () => {
        const clickEventSpy = spyOn(component.enterButton.nativeElement, 'click');
        document.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
            }),
        );
        expect(clickEventSpy).toHaveBeenCalled();
    });
});
