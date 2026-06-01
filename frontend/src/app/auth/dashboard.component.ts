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
    </main>
  `,
})
export class DashboardComponent implements OnInit {
  spotifyLinked = signal(false);

  constructor(public auth: AuthService, public spotifyAuth: SpotifyAuthService) {}

  async ngOnInit() {
    // Check local cache first, then fall back to backend
    if (this.spotifyAuth.isConnected() && this.spotifyAuth.getStoredProfile()) {
      this.spotifyLinked.set(true);
      return;
    }
    const token = this.auth.getToken();
    if (token) {
      const profile = await this.spotifyAuth.loadProfileFromBackend(token);
      this.spotifyLinked.set(!!profile);
    }
  }

  connectSpotify() {
    this.spotifyAuth.redirectToAuthCodeFlow();
  }

  async disconnectSpotify() {
    const token = this.auth.getToken();
    if (token) await this.spotifyAuth.disconnectFromBackend(token);
    this.spotifyAuth.disconnect();
    this.spotifyLinked.set(false);
  }
}
