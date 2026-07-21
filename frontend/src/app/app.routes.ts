import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { SpotifyProfileComponent } from './spotify-profile.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DashboardComponent } from './auth/dashboard.component';
import { CreatePostComponent } from './posts/create-post.component';
import { ProfileComponent } from './posts/profile.component';
import { PeopleSearchComponent } from './users/people-search.component';
import { UserProfileComponent } from './users/user-profile.component';
import { FriendsComponent } from './users/friends.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'spotify-user', component: SpotifyProfileComponent },
  { path: 'create-post', component: CreatePostComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'search', component: PeopleSearchComponent, canActivate: [authGuard] },
  { path: 'friends', component: FriendsComponent, canActivate: [authGuard] },
  { path: 'users/:id', component: UserProfileComponent, canActivate: [authGuard] },
];
