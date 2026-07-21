import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicUserCard, UsersApiService } from './users-api.service';
import { UserRowComponent } from './user-row.component';

@Component({
  selector: 'app-people-search',
  standalone: true,
  imports: [FormsModule, RouterLink, UserRowComponent],
  template: `
    <a routerLink="/dashboard" class="back-link">← Dashboard</a>
    <h1 class="page-title">Find people</h1>
    <p class="page-lead">Search by username. Follow anyone — no approval needed.</p>

    <div class="search-bar">
      <input
        class="input"
        type="search"
        [(ngModel)]="query"
        (ngModelChange)="onQueryChange()"
        (keyup.enter)="searchNow()"
        placeholder="Search by username…"
      />
      <button type="button" class="btn btn-primary" (click)="searchNow()" [disabled]="searching()">
        {{ searching() ? 'Searching…' : 'Search' }}
      </button>
    </div>

    @if (error()) {
      <p class="form-error">{{ error() }}</p>
    }

    @if (!searching() && searched() && results().length === 0) {
      <p class="empty">No users found.</p>
    }

    @for (user of results(); track user.id) {
      <app-user-row [user]="user" (follow)="onFollow($event)" (unfollow)="onUnfollow($event)" />
    }
  `,
})
export class PeopleSearchComponent implements OnDestroy {
  query = '';
  results = signal<PublicUserCard[]>([]);
  searching = signal(false);
  searched = signal(false);
  error = signal<string | null>(null);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private usersApi: UsersApiService) {}

  ngOnDestroy() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onQueryChange() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.searchNow(), 300);
  }

  async searchNow() {
    const q = this.query.trim();
    this.error.set(null);
    if (!q) {
      this.results.set([]);
      this.searched.set(false);
      return;
    }
    this.searching.set(true);
    try {
      this.results.set(await this.usersApi.search(q));
      this.searched.set(true);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.searching.set(false);
    }
  }

  async onFollow(user: PublicUserCard) {
    try {
      const updated = await this.usersApi.follow(user.id);
      this.patchResult(updated);
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  async onUnfollow(user: PublicUserCard) {
    try {
      const updated = await this.usersApi.unfollow(user.id);
      this.patchResult(updated);
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  private patchResult(updated: PublicUserCard) {
    this.results.update((list) =>
      list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)),
    );
  }
}
