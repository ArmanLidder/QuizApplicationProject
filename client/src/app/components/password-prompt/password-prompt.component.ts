import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service/admin-authenticator.service';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    @ViewChild('enterButton', { static: false }) enterButton: ElementRef;
    loginStatus: string | null = null;
    errorMessage: string = 'Mot de passe incorrect. Veuillez réessayer!';
    inputBorderColor: string = '';
    textColor: string = '';

    constructor(
        public router: Router,
        public authenticatorService: AdminAuthenticatorService,
    ) {}

    @HostListener('document:keydown.enter')
    handleKeyboardEvent() {
        this.enterButton.nativeElement.click();
    }

    updateStatus() {
        this.router.navigate(['/game-admin-page']).then((res) => {
            this.treatResponse(res);
        });
    }

    treatResponse(res: boolean): void {
        if (!res) {
            this.loginStatus = this.errorMessage;
            this.showErrorFeedback();
        } else {
            this.reset();
        }
    }

    reset() {
        this.loginStatus = null;
        this.textColor = '';
        this.inputBorderColor = '';
    }

    showErrorFeedback() {
        this.textColor = 'red-text';
        this.inputBorderColor = 'red-border';
    }
}
