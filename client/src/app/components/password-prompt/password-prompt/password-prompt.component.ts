import { Component } from '@angular/core';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    password: string = '';
    loginStatus: string = '';
    inputBorderColor: string = '';
    textColor: string = '';

    isPasswordGood() {
        return this.password === 'admin';
    }

    // For now this method enable a preview of the component but enventually we will have to change server validation
    validatePassword() {
        return (this.loginStatus = this.isPasswordGood() ? 'Login successful!' : 'Wrong password : Try again!');
    }

    isLoginSuccessful() {
        return this.loginStatus === 'Login successful!';
    }

    updateBorderColor() {
        return (this.inputBorderColor = this.isLoginSuccessful() ? 'green-border' : 'red-border');
    }

    updateTextColor() {
        return (this.textColor = this.isLoginSuccessful() ? 'green-text' : 'red-text');
    }

    resetInput() {
        if (!this.isLoginSuccessful()) this.password = '';
    }

    updateStyle() {
        this.updateBorderColor();
        this.updateTextColor();
        this.resetInput();
    }

    authentificateAdmin() {
        this.validatePassword();
        this.updateStyle();
    }
}
