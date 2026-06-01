import { Injectable } from '@angular/core';

const API = 'http://127.0.0.1:3000/api/auth';

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

@Injectable({ providedIn: 'root' })
export class SpotifyAuthService {
  private readonly clientId = '0fd697bedac14490886e3edb55026362';
  private readonly redirectUri = 'http://127.0.0.1:5173/spotify-user';
  private readonly scope = 'user-read-private user-read-email';
  private readonly verifierStorageKey = 'spotify_code_verifier';
  private readonly tokenKey = 'spotify_access_token';
  private readonly tokenExpiryKey = 'spotify_token_expiry';
  private readonly profileKey = 'spotify_profile';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    const token = this.getToken();
    if (!token) throw new Error('No Spotify access token available.');

    const params = new URLSearchParams({ q: query, type: 'track', limit: '10' });
    const res = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      this.disconnect();
      throw new Error('Spotify session expired. Please reconnect Spotify.');
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Spotify search failed: ${errText}`);
    }

    const data = await res.json();
    return data.tracks.items as SpotifyTrack[];
  }

  isConnected(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const expiry = Number(localStorage.getItem(this.tokenExpiryKey) ?? 0);
    return !!token && Date.now() < expiry;
  }

  getStoredProfile(): any | null {
    const raw = localStorage.getItem(this.profileKey);
    return raw ? JSON.parse(raw) : null;
  }

  async loadProfileFromBackend(authToken: string): Promise<any | null> {
    const res = await fetch(`${API}/spotify-profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.profile) {
      localStorage.setItem(this.profileKey, JSON.stringify(data.profile));
    }
    return data.profile ?? null;
  }

  async saveProfileToBackend(authToken: string, profile: any): Promise<void> {
    await fetch(`${API}/spotify-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ profile }),
    });
  }

  async disconnectFromBackend(authToken: string): Promise<void> {
    await fetch(`${API}/spotify-profile`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  }

  disconnect(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.profileKey);
  }

  private saveToken(token: string, expiresIn: number): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.tokenExpiryKey, String(Date.now() + expiresIn * 1000));
  }

  async redirectToAuthCodeFlow(): Promise<void> {
    const verifier = this.generateCodeVerifier(128);
    const challenge = await this.generateCodeChallenge(verifier);

    window.localStorage.setItem(this.verifierStorageKey, verifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scope,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const verifier = window.localStorage.getItem(this.verifierStorageKey);

    if (!verifier) {
      throw new Error('PKCE verifier not found in localStorage.');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: verifier,
    });

    const result = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!result.ok) {
      const errorText = await result.text();
      throw new Error(`Spotify token exchange failed: ${errorText}`);
    }

    const json = await result.json();
    this.saveToken(json.access_token, json.expires_in ?? 3600);
    return json.access_token;
  }

  async fetchProfile(token: string): Promise<any> {
    const result = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!result.ok) {
      const errorText = await result.text();
      throw new Error(`Spotify profile fetch failed: ${errorText}`);
    }

    const profile = await result.json();
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
    return profile;
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
