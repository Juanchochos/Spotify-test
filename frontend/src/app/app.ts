import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <main style="text-align: center; margin-top: 50px; font-family: sans-serif;">
      <h1>Welcome to Angular!</h1>
      <h2>Backend says: {{ apiMessage() }}</h2>
    </main>
  `,
})
export class App implements OnInit {
  apiMessage = signal<string>('Waiting for backend...');

  ngOnInit() {
    // Fetches from your local Hapi backend endpoint
    fetch('http://127.0.0.1:3000/api/hello')
      .then(response => response.json())
      .then(data => {
        this.apiMessage.set(data.message);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.apiMessage.set('Failed to connect to backend.');
      });
  }
}