import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicUserCard, UsersApiService } from './users-api.service';
import { UserRowComponent } from './user-row.component';

type FriendsTab = 'friends' | 'following' | 'followers';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [RouterLink, UserRowComponent],
  template: `
    <a routerLink="/dashboard" class="back-link">← Dashboard</a>
    <h1 class="page-title">People</h1>
    <p class="page-lead">
      Friends are mutual follows.
      <a routerLink="/search">Search</a> to find more.
    </p>

    <nav class="tabs">
      <button type="button" class="tab" [class.active]="tab() === 'friends'" (click)="setTab('friends')">
        Friends
      </button>
      <button type="button" class="tab" [class.active]="tab() === 'following'" (click)="setTab('following')">
        Following
      </button>
      <button type="button" class="tab" [class.active]="tab() === 'followers'" (click)="setTab('followers')">
        Followers
      </button>
    </nav>

    @if (loading()) {
      <p class="muted">Loading…</p>
    } @else if (error()) {
      <p class="form-error">{{ error() }}</p>
    } @else if (users().length === 0) {
      <p class="empty">
        @if (tab() === 'friends') {
          No friends yet — follow someone who follows you back.
        } @else if (tab() === 'following') {
          You’re not following anyone yet. <a routerLink="/search">Search people</a>
        } @else {
          No followers yet.
        }
      </p>
    } @else {
      @for (user of users(); track user.id) {
        <app-user-row [user]="user" (follow)="onFollow($event)" (unfollow)="onUnfollow($event)" />
      }
    }
  `,
})
export class FriendsComponent implements OnInit {
  tab = signal<FriendsTab>('friends');
  users = signal<PublicUserCard[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private usersApi: UsersApiService) {}

  ngOnInit() {
    this.load();
  }

  setTab(next: FriendsTab) {
    this.tab.set(next);
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const t = this.tab();
      if (t === 'friends') this.users.set(await this.usersApi.getFriends());
      else if (t === 'following') this.users.set(await this.usersApi.getFollowing());
      else this.users.set(await this.usersApi.getFollowers());
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async onFollow(user: PublicUserCard) {
    try {
      const updated = await this.usersApi.follow(user.id);
      this.users.update((list) => list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  async onUnfollow(user: PublicUserCard) {
    try {
      await this.usersApi.unfollow(user.id);
      if (this.tab() === 'following' || this.tab() === 'friends') {
        await this.load();
      } else {
        const updated = await this.usersApi.getProfile(user.id);
        this.users.update((list) =>
          list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
        );
      }
    } catch (err: any) {
      this.error.set(err.message);
    }
  }
}
