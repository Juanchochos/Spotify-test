import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyAuthService } from './spotify-auth.service';

@Component({
  selector: 'spotify-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main style="text-align:center; margin:40px auto; max-width:720px; font-family:sans-serif;">
      <h1>Spotify Profile</h1>

      <div *ngIf="loading(); else profileTemplate">
        <p>Loading Spotify profile...</p>
      </div>

      <ng-template #profileTemplate>
        <div *ngIf="error(); else successTemplate">
          <p style="color:crimson">{{ error() }}</p>
        </div>
      </ng-template>

      <ng-template #successTemplate>
        <div *ngIf="profile()">
          <h2>{{ profile()?.display_name }}</h2>
          <img
            *ngIf="profile()?.images?.[0]"
            [src]="profile()?.images[0].url"
            alt="Spotify avatar"
            width="200"
            style="border-radius:50%; margin:1rem 0;"
          />
          <ul style="list-style:none; padding:0; text-align:left;">
            <li><strong>User ID:</strong> {{ profile()?.id }}</li>
            <li><strong>Email:</strong> {{ profile()?.email }}</li>
            <li>
              <strong>Spotify URI:</strong>
              <a [href]="profile()?.external_urls?.spotify" target="_blank">{{ profile()?.uri }}</a>
            </li>
            <li>
              <strong>Link:</strong>
              <a [href]="profile()?.href" target="_blank">{{ profile()?.href }}</a>
            </li>
          </ul>
        </div>
      </ng-template>
    </main>
  `,
})
export class SpotifyProfileComponent implements OnInit {
  profile = signal<any | null>(null);
  error = signal<string | null>(null);
  loading = signal(true);

  constructor(private spotifyAuth: SpotifyAuthService) {}

  async ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      this.error.set('Spotify did not return an authorization code.');
      this.loading.set(false);
      return;
    }

    try {
      const token = await this.spotifyAuth.getAccessToken(code);
      const profile = await this.spotifyAuth.fetchProfile(token);
      this.profile.set(profile);
    } catch (err) {
      console.error(err);
      this.error.set('Unable to load Spotify profile. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
