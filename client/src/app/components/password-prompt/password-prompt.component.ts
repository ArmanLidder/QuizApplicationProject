import { Component } from '@angular/core';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    loginStatus: string | null = '';
    errorMessage: string = 'Invalid password. Please try again!';
    successMessage: string = 'Login Succesful';
    inputBorderColor: string = '';
    textColor: string = '';
    constructor(public authenticatorService: AdminAuthenticatorService) {}

    updateLoginStatus() {
        this.authenticatorService.authentificatePassword().subscribe((res) => {
            if (res.status === 200) this.loginStatus = this.successMessage;
            else this.loginStatus = this.errorMessage;
        });
        if (this.loginStatus === this.errorMessage) this.showErrorFeedback();
    }

    showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
