import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'spotify-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main style="text-align:center; margin:40px auto; max-width:720px; font-family:sans-serif;">
      <h1>Spotify Profile</h1>

      @if (loading()) {
        <p>Loading Spotify profile...</p>
      } @else if (error()) {
        <p style="color:crimson">{{ error() }}</p>
      } @else if (profile()) {
        <h2>{{ profile().display_name }}</h2>
        @if (profile().images?.[0]) {
          <img
            [src]="profile().images[0].url"
            alt="Spotify avatar"
            width="200"
            style="border-radius:50%; margin:1rem 0;"
          />
        }
        <ul style="list-style:none; padding:0; text-align:left; display:inline-block;">
          <li><strong>User ID:</strong> {{ profile().id }}</li>
          <li><strong>Email:</strong> {{ profile().email }}</li>
          <li>
            <strong>Spotify URI:</strong>
            <a [href]="profile().external_urls?.spotify" target="_blank">{{ profile().uri }}</a>
          </li>
          <li>
            <strong>Link:</strong>
            <a [href]="profile().href" target="_blank">{{ profile().href }}</a>
          </li>
        </ul>
      }

      @if (!loading()) {
        <nav style="margin-top:2rem; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <a
            routerLink="/dashboard"
            style="padding:10px 20px; text-decoration:none; border:1px solid #1db954; border-radius:4px; color:#1db954; font-size:15px;"
          >
            Go to Dashboard
          </a>
          <a
            routerLink="/profile"
            style="padding:10px 20px; text-decoration:none; border:1px solid #ccc; border-radius:4px; font-size:15px;"
          >
            View My Posts
          </a>
        </nav>
      }
    </main>
  `,
})
export class SpotifyProfileComponent implements OnInit {
  profile = signal<any | null>(null);
  error = signal<string | null>(null);
  loading = signal(true);

  constructor(private spotifyAuth: SpotifyAuthService, private auth: AuthService) {}

  async ngOnInit() {
    if (!this.auth.getToken()) {
      this.error.set('Please log in before connecting Spotify.');
      this.loading.set(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      try {
        const profile = await this.spotifyAuth.completeLogin(code);
        this.profile.set(profile);
        window.history.replaceState({}, '', '/spotify-user');
      } catch (err) {
        console.error(err);
        this.error.set('Unable to complete Spotify login. Please try again.');
      } finally {
        this.loading.set(false);
      }
      return;
    }

    try {
      const status = await this.spotifyAuth.getStatus();
      if (status.connected && status.profile) {
        this.profile.set(status.profile);
        this.loading.set(false);
        return;
      }
      await this.spotifyAuth.redirectToAuthCodeFlow();
    } catch (err) {
      console.error(err);
      this.error.set('Unable to load Spotify profile. Please try again.');
      this.loading.set(false);
    }
  }
}
