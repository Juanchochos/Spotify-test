import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'spotify-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="page-title">Spotify profile</h1>
    <p class="page-lead">Linked to your Wishare account.</p>

    @if (loading()) {
      <p class="muted">Loading Spotify profile…</p>
    } @else if (error()) {
      <p class="form-error">{{ error() }}</p>
    } @else if (profile()) {
      <div class="profile-header">
        @if (profile().images?.[0]) {
          <img
            class="avatar-round"
            [src]="profile().images[0].url"
            alt=""
            width="96"
            height="96"
          />
        }
        <div>
          <h2 style="font-size:1.5rem;">{{ profile().display_name }}</h2>
          <ul class="muted" style="list-style:none; padding:0; margin:0.75rem 0 0; font-size:0.9rem;">
            <li><strong style="color:var(--chalk)">ID:</strong> {{ profile().id }}</li>
            <li><strong style="color:var(--chalk)">Email:</strong> {{ profile().email }}</li>
          </ul>
        </div>
      </div>
    }

    @if (!loading()) {
      <div class="btn-row" style="margin-top:2rem;">
        <a routerLink="/dashboard" class="btn btn-primary">Dashboard</a>
        <a routerLink="/profile" class="btn btn-ghost">My posts</a>
      </div>
    }
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
