import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';
// import { Router } from '@angular/router';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    @ViewChild('submitButton') submitButton: ElementRef;
    loginStatus: string | null = '';
    errorMessage: string = 'Invalid password. Please try again!';
    successMessage: string = 'Login Succesful';
    inputBorderColor: string = '';
    textColor: string = '';
    constructor(
        public authenticatorService: AdminAuthenticatorService,
    ) {}

    updateStatus() {
            this.authenticatorService.validatePassword().subscribe((res) => {
            this.loginStatus = res ? this.successMessage : this.errorMessage;
            if (this.loginStatus === this.errorMessage) this.showErrorFeedback();
        });
    }

    showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
