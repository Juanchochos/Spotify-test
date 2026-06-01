import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { SpotifyAuthService } from '../spotify-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <main style="max-width:600px; margin:80px auto; font-family:sans-serif; padding:0 16px;">
      <h1>Welcome, {{ auth.currentUser()?.username }}!</h1>
      <p>Email: {{ auth.currentUser()?.email }}</p>

      <hr style="margin:24px 0;" />

      <button (click)="connectSpotify()" style="padding:8px 16px;">Connect Spotify</button>
      <button (click)="auth.logout()" style="padding:8px 16px; margin-left:12px;">Log out</button>
    </main>
  `,
})
export class DashboardComponent {
  constructor(public auth: AuthService, private spotifyAuth: SpotifyAuthService) {}

  connectSpotify() {
    this.spotifyAuth.redirectToAuthCodeFlow();
  }
}
