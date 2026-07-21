import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-nav">
        <a routerLink="/" class="app-brand">Wishare</a>
        <ul class="app-nav-links">
          @if (auth.isLoggedIn()) {
            <li><a routerLink="/dashboard" routerLinkActive="active">Home</a></li>
            <li><a routerLink="/search" routerLinkActive="active">Search</a></li>
            <li><a routerLink="/create-post" routerLinkActive="active">Create</a></li>
            <li><a routerLink="/friends" routerLinkActive="active">Friends</a></li>
            <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
            <li><button type="button" class="btn btn-ghost" style="padding:0.35rem 0.75rem;" (click)="auth.logout()">Log out</button></li>
          } @else {
            <li><a routerLink="/login" routerLinkActive="active">Log in</a></li>
            <li><a routerLink="/register" routerLinkActive="active">Register</a></li>
          }
        </ul>
      </header>
      <div class="app-main">
        <router-outlet />
      </div>
    </div>
  `,
})
export class App {
  constructor(public auth: AuthService) {}
}
