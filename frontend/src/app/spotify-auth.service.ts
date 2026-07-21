import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from './core/app-config';
import { AuthService } from './auth/auth.service';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
  external_urls: { spotify: string };
  duration_ms: number;
}

export interface SpotifyStatus {
  connected: boolean;
  profile: any | null;
}

@Injectable({ providedIn: 'root' })
export class SpotifyAuthService {
  private readonly scope = 'user-read-private user-read-email';
  private readonly verifierStorageKey = 'spotify_code_verifier';
  private readonly profileKey = 'spotify_profile';

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private auth: AuthService,
  ) {}

  private get spotifyApiUrl(): string {
    return `${this.config.apiBaseUrl}/spotify`;
  }

  private authHeaders(): HeadersInit {
    const token = this.auth.getToken();
    if (!token) throw new Error('You must be logged in to use Spotify.');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getStatus(): Promise<SpotifyStatus> {
    const res = await fetch(`${this.spotifyApiUrl}/status`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message ?? 'Failed to load Spotify status.');
    }
    const data = await res.json();
    if (data.profile) {
      localStorage.setItem(this.profileKey, JSON.stringify(data.profile));
    } else {
      localStorage.removeItem(this.profileKey);
    }
    return { connected: !!data.connected, profile: data.profile ?? null };
  }

  async isConnected(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.connected;
    } catch {
      return false;
    }
  }

  getStoredProfile(): any | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.profileKey);
    return raw ? JSON.parse(raw) : null;
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({ q: query });
    const res = await fetch(`${this.spotifyApiUrl}/search?${params.toString()}`, {
      headers: this.authHeaders(),
    });

    if (res.status === 401) {
      this.clearLocalCache();
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message ?? 'Spotify session expired. Please reconnect Spotify.');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message ?? 'Spotify search failed.');
    }

    return (await res.json()) as SpotifyTrack[];
  }

  async completeLogin(code: string): Promise<any> {
    const verifier = window.localStorage.getItem(this.verifierStorageKey);
    if (!verifier) {
      throw new Error('PKCE verifier not found in localStorage.');
    }

    const res = await fetch(`${this.spotifyApiUrl}/callback`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({ code, codeVerifier: verifier }),
    });

    window.localStorage.removeItem(this.verifierStorageKey);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message ?? 'Spotify login failed.');
    }

    if (data.profile) {
      localStorage.setItem(this.profileKey, JSON.stringify(data.profile));
    }
    return data.profile;
  }

  async disconnect(): Promise<void> {
    const token = this.auth.getToken();
    if (token) {
      await fetch(`${this.spotifyApiUrl}/disconnect`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    this.clearLocalCache();
  }

  clearLocalCache(): void {
    localStorage.removeItem(this.profileKey);
    localStorage.removeItem(this.verifierStorageKey);
  }

  async redirectToAuthCodeFlow(): Promise<void> {
    const verifier = this.generateCodeVerifier(128);
    const challenge = await this.generateCodeChallenge(verifier);

    window.localStorage.setItem(this.verifierStorageKey, verifier);

    const params = new URLSearchParams({
      client_id: this.config.spotifyClientId,
      response_type: 'code',
      redirect_uri: this.config.spotifyRedirectUri,
      scope: this.scope,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  private generateCodeVerifier(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
