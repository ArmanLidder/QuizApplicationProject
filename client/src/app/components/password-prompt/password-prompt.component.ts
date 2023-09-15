import { Component } from '@angular/core';
import { AdminAuthenticatorService } from '@app/services/admin-authenticator.service';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    password: string = '';
    inputBorderColor: string = '';
    textColor: string = '';
    loginStatus : string;
    constructor(public authenticatorService : AdminAuthenticatorService) {
        
    }

    updateLoginStatus() {
        this.loginStatus = this.authenticatorService.isPasswordGood() ? 'Login Succesfull' : 'Invalid password'
        if (this.loginStatus === 'Invalid password') this.authenticatorService.password ='';
    }
}
