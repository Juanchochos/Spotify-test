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
    const authToken = this.auth.getToken();

    // 1. Local cache with valid token — show immediately
    if (this.spotifyAuth.isConnected()) {
      const cached = this.spotifyAuth.getStoredProfile();
      if (cached) {
        this.profile.set(cached);
        this.loading.set(false);
        return;
      }
    }

    // 2. No local cache — try the backend (covers new device logins)
    if (authToken) {
      const backendProfile = await this.spotifyAuth.loadProfileFromBackend(authToken);
      if (backendProfile) {
        this.profile.set(backendProfile);
        this.loading.set(false);
        return;
      }
    }

    // 3. Nothing stored — start OAuth flow
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      await this.spotifyAuth.redirectToAuthCodeFlow();
      return;
    }

    try {
      const token = await this.spotifyAuth.getAccessToken(code);
      const profile = await this.spotifyAuth.fetchProfile(token);
      this.profile.set(profile);
      // Persist to backend so other devices can load it
      if (authToken) {
        await this.spotifyAuth.saveProfileToBackend(authToken, profile);
      }
    } catch (err) {
      console.error(err);
      this.error.set('Unable to load Spotify profile. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
