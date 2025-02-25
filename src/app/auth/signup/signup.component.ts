import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// ✅ Import Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule]
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSignup() {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.showToast('All fields are required', 'error');
      return;
    }

    const userData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };

    this.authService.signup(userData).subscribe(
      (response) => {
        console.log('Signup Response:', response);

        if (response.body?.authToken) { // ✅ Check if token is received
          this.showToast('Signup successful! Redirecting...', 'success');
          this.router.navigate(['/dashboard']); // ✅ Redirect to Dashboard
        } else {
          this.showToast('Signup failed. Please try again.', 'error');
        }
      },
      (error) => {
        this.showToast(error.error?.message || 'Signup failed. Please check your details.', 'error');
        console.error('Signup failed:', error);
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
