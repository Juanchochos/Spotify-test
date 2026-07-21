import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="back-link">← Wishare</a>
    <h1 class="page-title">Log in</h1>
    <p class="page-lead">Welcome back. Pick up where you left off.</p>

    @if (error()) {
      <p class="form-error">{{ error() }}</p>
    }

    <form class="stack" style="margin-top:1.5rem;" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
        {{ loading() ? 'Logging in…' : 'Log in' }}
      </button>
    </form>

    <p class="muted" style="margin-top:1.5rem;">
      No account? <a routerLink="/register">Register</a>
    </p>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }
}
