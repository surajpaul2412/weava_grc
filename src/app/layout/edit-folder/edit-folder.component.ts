import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-folder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-folder.component.html',
  styleUrls: ['./edit-folder.component.css'],
})
export class EditFolderComponent implements OnInit {
  inviteEmail = '';
  invitations: any[] = [];
  acceptedInvites: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { folderId: string; folderName: string },
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchInvitations();
    this.fetchAcceptedInvites();
  }

  private getAuthHeaders(): HttpHeaders | null {
    const user = localStorage.getItem('user');
    if (!user) {
      this.showToast('User not logged in', 'error');
      return null;
    }
    try {
      const parsedUser = JSON.parse(user);
      return new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
    } catch {
      this.showToast('Invalid user data', 'error');
      return null;
    }
  }

  fetchInvitations() {
    const headers = this.getAuthHeaders();
    if (!headers) return;

    this.http
      .get<any>(`https://weavadev1.azurewebsites.net/collaboration/folders/${this.data.folderId}/invite`, { headers })
      .subscribe({
        next: (res) => (this.invitations = res.invited || []),
        error: () => this.showToast('Failed to fetch invitations.', 'error'),
      });
  }

  fetchAcceptedInvites() {
    const headers = this.getAuthHeaders();
    if (!headers) return;

    this.http
      .get<any>(`https://weavadev1.azurewebsites.net/collaboration/folders/${this.data.folderId}/accept`, { headers })
      .subscribe({
        next: (res) => (this.acceptedInvites = res.acceptedUsers || []),
        error: () => this.showToast('Failed to fetch accepted invites.', 'error'),
      });
  }

  inviteUser() {
    if (!this.inviteEmail.trim()) {
      this.showToast('Please enter a valid email.', 'error');
      return;
    }
    const headers = this.getAuthHeaders();
    if (!headers) return;

    const payload = {
      email: this.inviteEmail,
      collectionTitle: this.data.folderName,
      senderDisplayName: this.inviteEmail,
      environment: 'Production',
    };

    this.http
      .post(`https://weavadev1.azurewebsites.net/collaboration/folders/${this.data.folderId}/invite`, payload, { headers })
      .subscribe({
        next: () => {
          this.showToast('Invitation sent successfully!', 'success');
          this.inviteEmail = '';
          this.fetchInvitations();
          this.fetchAcceptedInvites();
        },
        error: () => this.showToast('Failed to send invitation.', 'error'),
      });
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  getRandomColor(invite: any): string {
    if (!invite._color) {
      const colors = ['#007bff', '#28a745', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'];
      invite._color = colors[Math.floor(Math.random() * colors.length)];
    }
    return invite._color;
  }

  showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-toast' : 'error-toast',
    });
  }
}
