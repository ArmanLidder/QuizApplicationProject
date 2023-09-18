import { ComponentFixture, TestBed, waitForAsync, fakeAsync } from '@angular/core/testing';
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
        authServiceSpy = jasmine.createSpyObj('authServiceSpy', ['validatePassword']);
        authServiceSpy.validatePassword.and.returnValue(of(true));
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

    it('should navigate to /home when cancel button is clicked', () => {
        const cancelButton = fixture.debugElement.nativeElement.querySelector('.cancel');
        const navigateSpy = spyOn(router, 'navigate');
        cancelButton.click();
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should try to validatePasword & navigate to /game-admin-page when Enter button is clicked', fakeAsync(() => {
        const navigateSpy = spyOn(router, 'navigate');
        const enterButton = fixture.debugElement.nativeElement.querySelector('.enter');
        enterButton.click();
        expect(navigateSpy).toHaveBeenCalledWith(['/game-admin-page']);
        expect(authServiceSpy.validatePassword).toHaveBeenCalled();
    }));

    it('should set text and border colors to indicate an error', () => {
        component.showErrorFeedback();
        expect(component.textColor).toBe('red-text');
        expect(component.inputBorderColor).toBe('red-border');
    });
});

// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { PasswordPromptComponent } from './password-prompt.component';

// describe('PasswordPromptComponent', () => {
//     let component: PasswordPromptComponent;
//     let fixture: ComponentFixture<PasswordPromptComponent>;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [PasswordPromptComponent],
//         });
//         fixture = TestBed.createComponent(PasswordPromptComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should initialize properties', () => {
//         expect(component.password).toEqual('');
//         expect(component.loginStatus).toEqual('');
//         expect(component.inputBorderColor).toEqual('');
//         expect(component.textColor).toEqual('');
//     });

//     it('should validate a good password', () => {
//         component.password = 'admin';
//         component.validatePassword();
//         expect(component.isPasswordGood()).toBeTrue();
//         expect(component.loginStatus).toEqual('Login successful!');
//     });

//     it('should validate a wrong password', () => {
//         component.password = 'wrongpassword';
//         component.validatePassword();
//         expect(component.isPasswordGood()).toBeFalse();
//         expect(component.loginStatus).toEqual('Wrong password : Try again!');
//     });

//     it('should determine a successful login', () => {
//         component.loginStatus = 'Login successful!';
//         expect(component.isLoginSuccessful()).toBeTrue();
//         component.loginStatus = 'Wrong password : Try again!';
//         expect(component.isLoginSuccessful()).toBeFalse();
//     });

//     it('should update border color based on successful login', () => {
//         component.loginStatus = 'Login successful!';
//         component.updateBorderColor();
//         expect(component.inputBorderColor).toEqual('green-border');
//         component.loginStatus = 'Wrong password : Try again!';
//         component.updateBorderColor();
//         expect(component.inputBorderColor).toEqual('red-border');
//     });

//     it('should update text color based on successful login', () => {
//         component.loginStatus = 'Login successful!';
//         component.updateTextColor();
//         expect(component.textColor).toEqual('green-text');
//         component.loginStatus = 'Wrong password : Try again!';
//         component.updateTextColor();
//         expect(component.textColor).toEqual('red-text');
//     });

//     it('should reset input on unsuccessful login', () => {
//         component.password = 'admin';
//         component.loginStatus = 'Login successful!';
//         component.resetInput();
//         expect(component.password).toEqual('admin');
//         component.loginStatus = 'Wrong password : Try again!';
//         component.resetInput();
//         expect(component.password).toEqual('');
//     });

//     it('should update styles based on authentication', () => {
//         component.password = 'admin';
//         component.authentificateAdmin();
//         expect(component.inputBorderColor).toEqual('green-border');
//         expect(component.textColor).toEqual('green-text');
//         expect(component.password).toEqual('admin');
//     });

//     it('should update styles for unsuccessful authentication', () => {
//         component.password = 'wrongpassword';
//         component.authentificateAdmin();
//         expect(component.inputBorderColor).toEqual('red-border');
//         expect(component.textColor).toEqual('red-text');
//         expect(component.password).toEqual('');
//     });
// });
