import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  private apiUrl = environment.apiBaseUrl; // ✅ Use API Base URL from environment

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user)); // ✅ Load user from storage on app start
    }
  }

  getUserObservable(): Observable<any> {
    return this.userSubject.asObservable();
  }

  getUser() {
    return this.userSubject.value;
  }

  // ✅ Call API for login
  login(credentials: { email: string; password: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, { observe: 'response' }).pipe(
      tap(response => {
        if (response.body?.authToken) { // ✅ Ensure token exists
          localStorage.setItem('user', JSON.stringify(response.body)); // ✅ Store user data
          this.userSubject.next(response.body); // ✅ Update auth state
        }
      }),
      catchError(error => {
        throw error; // ✅ Let the component handle errors
      })
    );
  }

  // ✅ Call API for signup
  signup(userData: { email: string; password: string; firstName: string; lastName: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/auth/signup`, userData, { observe: 'response' }).pipe(
      tap((response) => {
        if (response.body?.authToken) { // ✅ Ensure token exists
          localStorage.setItem('user', JSON.stringify(response.body)); // ✅ Store user data
          this.userSubject.next(response.body); // ✅ Update auth state
        }
      }),
      catchError((error) => {
        throw error; // ✅ Let the component handle errors
      })
    );
  }

  logout() {
    localStorage.removeItem('user'); // ✅ Clear storage on logout
    this.userSubject.next(null);
  }
}
