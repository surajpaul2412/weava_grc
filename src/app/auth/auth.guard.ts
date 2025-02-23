import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = localStorage.getItem('user'); // ✅ Check if user exists
    const isLoginOrSignup = route.routeConfig?.path === 'login' || route.routeConfig?.path === 'signup';

    if (user && isLoginOrSignup) {
      // ✅ If logged-in user tries to visit `/login` or `/signup`, redirect to `/dashboard`
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (!user && !isLoginOrSignup) {
      // ✅ If unauthenticated user tries to visit a protected route, redirect to `/login`
      this.router.navigate(['/login']);
      return false;
    }

    return true; // ✅ Allow access if conditions are met
  }
}
