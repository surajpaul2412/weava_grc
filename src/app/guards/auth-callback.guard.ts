import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';

@Injectable({ providedIn: 'root' })
export class AuthCallbackGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private socket: SocketService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const token = route.queryParamMap.get('token');
    const userId = route.queryParamMap.get('userId'); // optional

    if (token) {
      this.auth.setToken(token);

      // optional websocket
      try {
        this.socket.connect(token);
        if (userId) this.socket.emitLogin(userId);
      } catch {}

      return this.router.parseUrl('/dashboard');
    }

    return this.router.parseUrl('/login');
  }
}
