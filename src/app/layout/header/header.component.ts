import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { NgIf, AsyncPipe } from '@angular/common'; // ✅ Import NgIf and AsyncPipe

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [NgIf, AsyncPipe]
})
export class HeaderComponent {
  user$!: Observable<any>; // ✅ Declare it first

  constructor(private authService: AuthService) {
    this.user$ = this.authService.getUserObservable(); // ✅ Initialize inside constructor
  }
}
