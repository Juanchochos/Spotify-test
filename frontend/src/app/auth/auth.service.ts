import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

const API = 'http://127.0.0.1:3000/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(this.loadUser());

  constructor(private router: Router) {}

  async register(email: string, username: string, password: string): Promise<void> {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Registration failed.');
    this.saveSession(data);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Login failed.');
    this.saveSession(data);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveSession(data: { access_token: string; user: AuthUser }): void {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    this.currentUser.set(data.user);
    this.router.navigate(['/dashboard']);
  }

  private loadUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
