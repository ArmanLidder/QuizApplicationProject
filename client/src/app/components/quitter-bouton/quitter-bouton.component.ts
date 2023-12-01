import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-quitter-button',
    templateUrl: './quitter-bouton.component.html',
    styleUrls: ['./quitter-bouton.component.scss'],
})
export class QuitterButtonComponent {
    constructor(
        private dialog: MatDialog,
        private router: Router,
    ) {}

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '300px',
            data: { message: 'Etes-vous sur de vouloir quitter?' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate(['./home']);
            }
        });
    }
}
