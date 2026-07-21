import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <p class="eyebrow">Share what you’re playing</p>
      <h1 class="hero-brand">Wish<span>are</span></h1>
      <hr class="hero-groove" />
      <p class="hero-copy">
        Post the songs on your mind. Find people who listen the way you do.
      </p>
      <div class="btn-row">
        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="btn btn-primary">Open your night</a>
          <a routerLink="/create-post" class="btn btn-ghost">Create a post</a>
        } @else {
          <a routerLink="/register" class="btn btn-primary">Get started</a>
          <a routerLink="/login" class="btn btn-ghost">Log in</a>
        }
      </div>
    </section>
  `,
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
}
