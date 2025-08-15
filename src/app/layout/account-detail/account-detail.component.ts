import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

export interface AccountDetailsData {
  name: string;
  email: string;
  subscriptionPlan: string;     // e.g., "Free"
  cardNote: string;             // e.g., "Credit card details not found."
  referralId: string;
  avatarUrl?: string;
  realtimeNotification?: boolean;
}

@Component({
  selector: 'account-detail-folder',
  standalone: true,
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
  imports: [FormsModule]
})
export class AccountDetailComponent implements OnInit {

  model: AccountDetailsData = {
    name: '',
    email: '',
    subscriptionPlan: '',
    cardNote: '',
    referralId: '',
    avatarUrl: '',
    realtimeNotification: false
  };

  private readonly API_BASE = '/api/account';

  isToggling = false;
  isDeleting = false;
  isDownloading = false;

  constructor(
    public dialogRef: MatDialogRef<AccountDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AccountDetailsData,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.model = { ...this.data };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async copyReferralId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.model.referralId || '');
      this.toast('Referral ID copied');
    } catch {
      this.toast('Unable to copy Referral ID', true);
    }
  }

  onToggleRealtime(): void {
    const enabled = !!this.model.realtimeNotification;
    this.isToggling = true;

    this.http
      .patch<{ success: boolean }>(`${this.API_BASE}/realtime-notification`, { enabled })
      .subscribe({
        next: () => {
          this.toast(`Real-time notification ${enabled ? 'enabled' : 'disabled'}`);
          this.isToggling = false;
        },
        error: () => {
          this.model.realtimeNotification = !enabled; // revert on error
          this.toast('Failed to update notification preference', true);
          this.isToggling = false;
        }
      });
  }

  downloadInvoice(): void {
    this.isDownloading = true;
    this.http.get(`${this.API_BASE}/invoice/latest`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
      },
      error: () => {
        this.toast('Unable to download invoice', true);
        this.isDownloading = false;
      }
    });
  }

  changePassword(): void {
    this.dialogRef.close({ action: 'change-password' });
  }

  deleteAccount(): void {
    const yes = confirm('Are you sure you want to delete this account? This action cannot be undone.');
    if (!yes) return;

    this.isDeleting = true;
    this.http.delete(`${this.API_BASE}`).subscribe({
      next: () => {
        this.toast('Account deleted');
        this.isDeleting = false;
        this.dialogRef.close({ action: 'deleted' });
      },
      error: () => {
        this.toast('Failed to delete account', true);
        this.isDeleting = false;
      }
    });
  }

  editEmail(): void {
    this.dialogRef.close({ action: 'edit-email', email: this.model.email });
  }

  sendEmail(): void {
    window.location.href = `mailto:${this.model.email}`;
  }

  linkGoogle(): void {
    window.location.href = `${this.API_BASE}/link/google`;
  }

  private toast(message: string, isError = false): void {
    this.snackBar.open(message, 'OK', {
      duration: 2500,
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}
