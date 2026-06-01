import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main style="max-width:400px; margin:80px auto; font-family:sans-serif; padding:0 16px;">
      <h1>Create an account</h1>

      @if (error()) {
        <p style="color:crimson">{{ error() }}</p>
      }

      <form (ngSubmit)="onSubmit()">
        <div style="margin-bottom:12px;">
          <label>Email<br />
            <input type="email" [(ngModel)]="email" name="email" required style="width:100%; padding:8px; box-sizing:border-box;" />
          </label>
        </div>
        <div style="margin-bottom:12px;">
          <label>Username<br />
            <input type="text" [(ngModel)]="username" name="username" required minlength="3" maxlength="30" style="width:100%; padding:8px; box-sizing:border-box;" />
          </label>
        </div>
        <div style="margin-bottom:16px;">
          <label>Password<br />
            <input type="password" [(ngModel)]="password" name="password" required minlength="8" style="width:100%; padding:8px; box-sizing:border-box;" />
          </label>
        </div>
        <button type="submit" [disabled]="loading()" style="width:100%; padding:10px; font-size:16px;">
          {{ loading() ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p style="margin-top:16px;">Already have an account? <a routerLink="/login">Log in</a></p>
    </main>
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
