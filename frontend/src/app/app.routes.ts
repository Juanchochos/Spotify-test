import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SpotifyProfileComponent } from './spotify-profile.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './auth/dashboard.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'spotify-user', component: SpotifyProfileComponent },
];
