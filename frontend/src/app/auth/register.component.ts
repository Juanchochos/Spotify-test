import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/" class="back-link">← Wishare</a>
    <h1 class="page-title">Create an account</h1>
    <p class="page-lead">Pick a username friends can find.</p>

    @if (error()) {
      <p class="form-error">{{ error() }}</p>
    }

    <form class="stack" style="margin-top:1.5rem;" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
      </div>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" type="text" [(ngModel)]="username" name="username" required minlength="3" maxlength="30" autocomplete="username" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" [(ngModel)]="password" name="password" required minlength="8" autocomplete="new-password" />
      </div>
      <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
        {{ loading() ? 'Creating account…' : 'Register' }}
      </button>
    </form>

    <p class="muted" style="margin-top:1.5rem;">
      Already have an account? <a routerLink="/login">Log in</a>
    </p>
  `,
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.register(this.email, this.username, this.password);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }
}
