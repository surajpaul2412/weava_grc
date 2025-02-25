import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// ✅ Import Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule, // ✅ Required for [(ngModel)]
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.showToast('Please enter email and password', 'error');
      return;
    }

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe(
      (response) => {
        console.log('Login Response:', response);

        if (response.body?.authToken) { // ✅ Check for token
          this.showToast('Login successfully', 'success');
          this.router.navigate(['/dashboard']); // ✅ Redirect to Dashboard
        } else {
          this.showToast('Invalid credentials. Please try again.', 'error');
        }
      },
      (error) => {
        this.showToast(error.error?.message || 'Login failed. Please check your credentials.', 'error');
        console.error('Login failed:', error);
      }
    );
  }

  showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-toast' : 'error-toast'
    });
  }
}
