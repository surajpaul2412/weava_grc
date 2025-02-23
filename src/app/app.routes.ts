import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // ✅ Default page is /login
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardHomeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' } // Redirect unknown routes to /login
];
