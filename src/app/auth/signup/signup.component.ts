import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule] // ✅ Add RouterModule
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  onSignup() {
    console.log('Signing up with', this.name, this.email, this.password);
  }
}
