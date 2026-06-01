import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main style="text-align:center; margin-top:80px; font-family:sans-serif;">
      <h1>Welcome to the App</h1>

      @if (auth.isLoggedIn()) {
        <p>You are logged in as <strong>{{ auth.currentUser()?.username }}</strong>.</p>
        <a routerLink="/dashboard">Go to Dashboard</a>
      } @else {
        <p><a routerLink="/login">Log in</a> &nbsp;|&nbsp; <a routerLink="/register">Register</a></p>
      }
    </main>
  `,
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}
