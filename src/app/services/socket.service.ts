import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;

  // Connect socket after login with auth token
  connect(token: string): void {
    this.socket = io(environment.socketUrl, {
      transports: ['websocket'],
      path: '/socket.io',
      auth: { token },
    });
  
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });
  
    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message || err);
    });
  
    this.socket.on('disconnect', (reason) => {
      console.warn('🔌 Socket disconnected:', reason);
    });
  
    this.socket.on('message', (msg) => {
      console.log('📨 Server message:', msg);
    });
  }  

  // Emit a login-specific event (optional)
  emitLogin(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('login', { userId });
    }
  }

  // Subscribe to a specific event/channel
  subscribeToChannel(channel: string, callback: (data: any) => void): void {
    this.socket.on(channel, callback);
  }

  // Emit any event
  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Optional: Get raw socket instance
  getSocket(): Socket {
    return this.socket;
  }
}
