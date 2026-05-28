import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SpotifyAuthService {
  private readonly clientId = '0fd697bedac14490886e3edb55026362';
  private readonly redirectUri = 'http://127.0.0.1:5173/spotify-user';
  private readonly scope = 'user-read-private user-read-email';
  private readonly verifierStorageKey = 'spotify_code_verifier';

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

    return result.json();
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
