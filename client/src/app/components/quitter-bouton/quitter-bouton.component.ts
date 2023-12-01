import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-quitter-button',
    templateUrl: './quitter-bouton.component.html',
    styleUrls: ['./quitter-bouton.component.scss'],
})
export class QuitterButtonComponent {
    constructor(private dialog: MatDialog) {}

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { message: 'Are you sure you want to proceed?' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Action to perform on confirmation
                console.log('User confirmed.');
                // Call your method or perform any action here
            } else {
                // Action to perform if canceled
                console.log('User canceled.');
            }
        });
    }

}