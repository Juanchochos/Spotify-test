import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main style="max-width:400px; margin:80px auto; font-family:sans-serif; padding:0 16px;">
      <h1>Log in</h1>

      @if (error()) {
        <p style="color:crimson">{{ error() }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        <div style="margin-bottom:12px;">
          <label>Email<br />
            <input type="email" [(ngModel)]="email" name="email" required style="width:100%; padding:8px; box-sizing:border-box;" />
          </label>
        </div>
        <div style="margin-bottom:16px;">
          <label>Password<br />
            <input type="password" [(ngModel)]="password" name="password" required style="width:100%; padding:8px; box-sizing:border-box;" />
          </label>
        </div>
        <button type="submit" [disabled]="loading()" style="width:100%; padding:10px; font-size:16px;">
          {{ loading() ? 'Logging in...' : 'Log in' }}
        </button>
      </form>

      <p style="margin-top:16px;">Don't have an account? <a routerLink="/register">Register</a></p>
    </main>
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
