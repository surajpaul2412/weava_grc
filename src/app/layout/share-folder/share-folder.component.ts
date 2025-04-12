import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar'; // ✅ Add this

@Component({
  selector: 'app-share-folder',
  standalone: true,
  templateUrl: './share-folder.component.html',
  styleUrls: ['./share-folder.component.css'],
  imports: [CommonModule, FormsModule] // ✅ FormsModule added here
})
export class ShareFolderComponent {
  inviteEmail: string = '';

  constructor(
    public dialogRef: MatDialogRef<ShareFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderId: string, folderName: string },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  inviteUser() {
    const user = localStorage.getItem('user');
    if (!user) {
      this.showToast('User not logged in', 'error');
      return;
    }
  
    const parsedUser = JSON.parse(user);
  
    const payload = {
      email: this.inviteEmail,
      collectionTitle: this.data.folderName,
      senderDisplayName: this.inviteEmail || 'Unknown',
      environment: 'Production'
    };
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
  
    this.http.post(`https://weavadev1.azurewebsites.net/collaboration/folders/${this.data.folderId}/invite`, payload, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Response:', response);
          this.showToast('Invitation sent successfully!', 'success');
          this.inviteEmail = '';
        },
        error: (err) => {
          console.error('❌ Error inviting user:', err);
          this.showToast('Failed to send invitation.', 'error');
        }
      });
  }  

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-toast' : 'error-toast'
    });
  }
  
}
