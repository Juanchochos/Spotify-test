import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { SpotifyAuthService } from '../spotify-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main style="max-width:600px; margin:80px auto; font-family:sans-serif; padding:0 16px;">
      <h1>Welcome, {{ auth.currentUser()?.username }}!</h1>
      <p>Email: {{ auth.currentUser()?.email }}</p>

      <hr style="margin:24px 0;" />

      @if (spotifyLinked()) {
        <a routerLink="/spotify-user" style="padding:8px 16px; text-decoration:none; border:1px solid #ccc; border-radius:4px;">View Spotify Profile</a>
        <button (click)="disconnectSpotify()" style="padding:8px 16px; margin-left:12px;">Disconnect Spotify</button>
      } @else {
        <button (click)="connectSpotify()" style="padding:8px 16px;">Connect Spotify</button>
      }

      <button (click)="auth.logout()" style="padding:8px 16px; margin-left:12px;">Log out</button>

      <hr style="margin:24px 0;" />

      <nav style="display:flex; gap:12px; flex-wrap:wrap;">
        <a routerLink="/create-post" style="padding:8px 16px; text-decoration:none; border:1px solid #1db954; border-radius:4px; color:#1db954;">
          + Create Post
        </a>
        <a routerLink="/profile" style="padding:8px 16px; text-decoration:none; border:1px solid #ccc; border-radius:4px;">
          My Profile
        </a>
      </nav>
    </main>
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
