import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);

  constructor() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  getUserObservable(): Observable<any> {
    return this.userSubject.asObservable();
  }

  login(credentials: { email: string; password: string }): Observable<any> { // ✅ Return Observable
    const userData = {
      status: 200,
      message: 'Login successful',
      data: {
        token: 'dummy-token',
        user: {
          email: credentials.email,
          name: 'John Doe'
        }
      }
    };

    localStorage.setItem('user', JSON.stringify(userData.data));
    this.userSubject.next(userData.data); // ✅ Update observable on login
    return of(userData); // ✅ Simulate API response as Observable
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }
}
