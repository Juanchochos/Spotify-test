import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { SpotifyAuthService } from '../spotify-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <p class="eyebrow">Signed in</p>
    <h1 class="page-title">Hey, {{ auth.currentUser()?.username }}</h1>
    <p class="page-lead">{{ auth.currentUser()?.email }}</p>

    <div class="panel">
      <h2 style="font-size:1.1rem; margin-bottom:0.75rem;">Spotify</h2>
      @if (spotifyLinked()) {
        <p class="muted" style="margin:0 0 1rem;">Connected — search tracks when you post.</p>
        <div class="btn-row">
          <a routerLink="/spotify-user" class="btn btn-ghost">View Spotify profile</a>
          <button type="button" class="btn btn-ghost" (click)="disconnectSpotify()">Disconnect</button>
        </div>
      } @else {
        <p class="muted" style="margin:0 0 1rem;">Connect Spotify to search songs for your posts.</p>
        <button type="button" class="btn btn-primary" (click)="connectSpotify()">Connect Spotify</button>
      }
    </div>

    <hr class="divider" />

    <div class="btn-row">
      <a routerLink="/create-post" class="btn btn-primary">+ Create post</a>
      <a routerLink="/profile" class="btn btn-ghost">My profile</a>
      <a routerLink="/search" class="btn btn-ghost">Find people</a>
      <a routerLink="/friends" class="btn btn-ghost">Friends</a>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  spotifyLinked = signal(false);

  constructor(public auth: AuthService, public spotifyAuth: SpotifyAuthService) {}

  async ngOnInit() {
    if (!this.auth.getToken()) return;
    try {
      const status = await this.spotifyAuth.getStatus();
      this.spotifyLinked.set(status.connected);
    } catch {
      this.spotifyLinked.set(false);
    }
  }

  connectSpotify() {
    this.spotifyAuth.redirectToAuthCodeFlow();
  }

  async disconnectSpotify() {
    await this.spotifyAuth.disconnect();
    this.spotifyLinked.set(false);
  }
}
