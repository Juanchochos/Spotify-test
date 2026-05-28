import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SpotifyProfileComponent } from './spotify-profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'spotify-user', component: SpotifyProfileComponent },
];
