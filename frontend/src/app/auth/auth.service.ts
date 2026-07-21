import { Inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { APP_CONFIG, AppConfig } from '../core/app-config';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthUser | null>(this.loadUser());

  constructor(
    private router: Router,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {}

  private get apiUrl(): string {
    return `${this.config.apiBaseUrl}/auth`;
  }

  async register(email: string, username: string, password: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Registration failed.');
    this.saveSession(data);
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${this.apiUrl}/login`, {
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
