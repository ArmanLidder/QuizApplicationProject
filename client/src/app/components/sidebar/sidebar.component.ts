import { Component } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    messages: string[] = [];
    newMessage: string = '';

    sendMessage() {
        if (this.newMessage) {
            this.messages.push(this.newMessage);
            this.newMessage = '';
        }
    }
}
