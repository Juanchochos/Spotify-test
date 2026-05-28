import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main style="text-align: center; margin-top: 50px; font-family: sans-serif;">
      <h1>Welcome to Angular!</h1>
      <p>Click the button below to authorize with Spotify.</p>
      <button
        type="button"
        (click)="onSpotifyLogin()"
        style="padding:12px 24px; font-size:16px; margin:1rem 0;"
      >
        Login with Spotify
      </button>

      <p>
        After approval, Spotify will return you to the profile page.
        <a routerLink="/spotify-user">View Spotify profile page</a>
      </p>

      <h2>Backend says: {{ apiMessage() }}</h2>
    </main>
  `,
})
export class HomeComponent implements OnInit {
  apiMessage = signal<string>('Waiting for backend...');

  constructor(private spotifyAuthService: SpotifyAuthService) {}

  ngOnInit() {
    fetch('http://127.0.0.1:3000/api/hello')
      .then((response) => response.json())
      .then((data) => {
        this.apiMessage.set(data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.apiMessage.set('Failed to connect to backend.');
      });
  }

  onSpotifyLogin() {
    this.spotifyAuthService.redirectToAuthCodeFlow();
  }
}
