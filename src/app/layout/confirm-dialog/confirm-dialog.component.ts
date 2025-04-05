import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderName: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Close dialog and pass true for confirmation
  }

  onCancel(): void {
    this.dialogRef.close(false); // Close dialog and pass false for cancellation
  }
}
