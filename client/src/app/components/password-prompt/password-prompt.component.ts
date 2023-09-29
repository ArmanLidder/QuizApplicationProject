import { Router } from '@angular/router';
import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    @ViewChild('enterButton', { static: false }) enterButton: ElementRef;
    loginStatus: string | null = '';
    errorMessage: string = 'Invalid password. Please try again!';
    successMessage: string = 'Login Succesful';
    inputBorderColor: string = '';
    textColor: string = '';
    constructor(public authenticatorService: AdminAuthenticatorService, private router: Router) {}

    @HostListener('document:keydown.enter')
    handleKeyboardEvent() {
        this.enterButton.nativeElement.click();
    }

    updateStatus() {
        this.router.navigate(['/game-admin-page']).then((res) => {
            this.loginStatus = res ? this.successMessage : this.errorMessage;
            if (this.loginStatus === this.errorMessage) this.showErrorFeedback();
        });
    }

    showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
