import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SocketService } from '../../services/socket.service'; // ✅ Add import
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FontAwesomeModule
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private socketService: SocketService
  ) {}

  loginWithGoogle() {
    const width = 500, height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top  = window.screenY + (window.outerHeight - height) / 2;
  
    const popup = window.open(
      `${environment.apiBaseUrl}/auth/google`,
      'GoogleSignIn',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  
    const allowedOrigin = window.location.origin; // https://weavadev.z10.web.core.windows.net
  
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
  
      const data = event.data || {};
      // Expecting: { authToken, uid, email, displayName?, expirationTime? }
      if (data?.authToken && data?.uid) {
        const userObj = {
          authToken: data.authToken,
          createdAt: data.createdAt ?? Date.now(),
          displayName: data.displayName ?? '',
          email: data.email ?? '',
          emailVerified: !!data.emailVerified,
          expirationTime: data.expirationTime ?? '3600',
          uid: data.uid
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('authToken', data.authToken);
  
        try {
          this.socketService.connect(data.authToken);
          this.socketService.emitLogin(data.uid);
        } catch {}
  
        this.router.navigate(['/dashboard']);
      }
  
      window.removeEventListener('message', onMessage);
      popup?.close();
    };
  
    window.addEventListener('message', onMessage, { once: true });
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.showToast('Please enter email and password', 'error');
      return;
    }

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe(
      (response) => {
        console.log('Login Response:', response);

        const token = response.body?.authToken;
        const userId = response.body?.userId; // Optional: if available

        if (token) {
          // ✅ Save token in localStorage
          localStorage.setItem('authToken', token);
        
          // Optional: Save userId
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        
          // ✅ Connect WebSocket
          this.socketService.connect(token);
        
          if (userId) {
            this.socketService.emitLogin(userId);
          }
        
          this.router.navigate(['/dashboard']);
        } else {
          this.showToast('Invalid credentials. Please try again.', 'error');
        }
      },
      (error) => {
        this.showToast(
          error.error?.message || 'Login failed. Please check your credentials.',
          'error'
        );
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

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
