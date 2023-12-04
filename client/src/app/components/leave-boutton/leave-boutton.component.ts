import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { popUpMessage } from '@common/browser-message/displayable-message/popup-message';
@Component({
    selector: 'app-leave-boutton',
    templateUrl: './leave-boutton.component.html',
    styleUrls: ['./leave-boutton.component.scss'],
})
export class LeaveButtonComponent {
    @Input() isGame: boolean = true;
    constructor(
        private dialog: MatDialog,
        private router: Router,
    ) {}
    @Input() action: () => void = async () => this.router.navigate(['./home']);
    openConfirmationDialog(): void {
        const message = this.isGame ? popUpMessage.LEAVE_MESSAGE : popUpMessage.DELETE_MESSAGE;
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { message },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.action();
            }
        });
    }
}
