import { Component, OnInit } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit {
    readonly title: string = 'OnlyQuiz';

    constructor(private socketClientService: SocketClientService) {}

    ngOnInit() {
        if (this.socketClientService.isSocketAlive()) this.socketClientService.disconnect();
    }
}
