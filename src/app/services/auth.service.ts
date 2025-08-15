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
  private apiUrl = environment.apiBaseUrl;
  // Explicit signup URL per your spec:
  private signupUrl = 'https://weavadev1.azurewebsites.net/auth/signup';

  private TOKEN_KEY = 'authToken';

  // ADD ↓
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    // optional: userSubject update mat karo yahan (server se user fetch karna ho to later)
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) this.userSubject.next(JSON.parse(user));
  }

  getUserObservable(): Observable<any> {
    return this.userSubject.asObservable();
  }

  getUser() {
    return this.userSubject.value;
  }

  // Email/password login (kept using environment base URL)
  login(credentials: { email: string; password: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials, { observe: 'response' }).pipe(
      tap(response => {
        const body = response.body || {};
        const authToken = body.authToken || body.token || body.accessToken;
        if (authToken) {
          localStorage.setItem('user', JSON.stringify(body));
          this.userSubject.next(body);
        }
      }),
      catchError(error => { throw error; })
    );
  }

  // Email/password signup -> uses the absolute URL you provided
  signup(userData: { email: string; password: string; firstName: string; lastName: string }): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.signupUrl, userData, { observe: 'response' }).pipe(
      tap(response => {
        const body = response.body || {};
        const authToken = body.authToken || body.token || body.accessToken;
        if (authToken) {
          localStorage.setItem('user', JSON.stringify(body));
          this.userSubject.next(body);
        }
      }),
      catchError(error => { throw error; })
    );
  }

  // Social auth (Google ID token or Facebook access token)
  socialAuth(provider: 'google' | 'facebook', token: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, { provider, token }, { observe: 'response' }).pipe(
      tap(response => {
        console.log(response.body);


        const body = response.body || {};
        const authToken = body.authToken || body.token || body.accessToken;
        if (authToken) {
          localStorage.setItem('user', JSON.stringify(body));
          this.userSubject.next(body);
        }
      }),
      catchError(error => { throw error; })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }
}
