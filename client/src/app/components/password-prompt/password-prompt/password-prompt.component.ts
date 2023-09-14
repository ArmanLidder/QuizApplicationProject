import { Component } from '@angular/core';

@Component({
    selector: 'app-password-prompt',
    templateUrl: './password-prompt.component.html',
    styleUrls: ['./password-prompt.component.scss'],
})
export class PasswordPromptComponent {
    password: string = '';
    loginStatus: string = '';

    verifyPassword() {
        return (this.loginStatus = this.password === 'admin' ? 'Login successful!' : 'Wrong password : Try again!');
    }
}
