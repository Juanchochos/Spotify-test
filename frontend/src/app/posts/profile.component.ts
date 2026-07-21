import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService, PostResponse } from './posts.service';
import { PublicUserCard, UsersApiService } from '../users/users-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="profile-header">
      <div style="flex:1;">
        <p class="eyebrow">Your posts</p>
        <h1>{{ auth.currentUser()?.username }}</h1>
        @if (stats()) {
          <p class="muted" style="margin:0.5rem 0 0;">
            {{ stats()!.followerCount }} followers · {{ stats()!.followingCount }} following
            · <a routerLink="/friends">Manage</a>
          </p>
        }
      </div>
      <div class="btn-row">
        <a routerLink="/search" class="btn btn-ghost">Find people</a>
        <a routerLink="/create-post" class="btn btn-primary">+ New post</a>
      </div>
    </div>
    <a routerLink="/dashboard" class="back-link">← Dashboard</a>

    @if (loading()) {
      <p class="muted">Loading posts…</p>
    } @else if (error()) {
      <p class="form-error">{{ error() }}</p>
    } @else if (posts().length === 0) {
      <p class="empty">
        No posts yet. <a routerLink="/create-post">Create your first post</a>
      </p>
    } @else {
      <ul style="list-style:none; padding:0; margin:1.5rem 0 0;">
        @for (post of posts(); track post.id) {
          <li class="post-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
              <small class="muted">{{ formatDate(post.createdAt) }}</small>
              <button type="button" class="btn-danger" (click)="deletePost(post.id)">Delete</button>
            </div>
            @if (post.description) {
              <p style="margin:0 0 0.75rem;">{{ post.description }}</p>
            }
            @if (post.songs.length === 0) {
              <p class="muted" style="font-style:italic; margin:0;">No songs in this post.</p>
            } @else {
              @for (song of post.songs; track song.id) {
                <div class="song-row">
                  @if (song.albumImageUrl) {
                    <img [src]="song.albumImageUrl" width="48" height="48" alt="" />
                  }
                  <div>
                    <strong>{{ song.trackName }}</strong><br />
                    <small class="muted">{{ song.artistName }} — {{ song.albumName }}</small>
                    @if (song.description) {
                      <p style="margin:0.25rem 0 0; font-size:0.85rem;" class="muted">{{ song.description }}</p>
                    }
                  </div>
                </div>
              }
            }
          </li>
        }
      </ul>
    }
  `,
})
export class ProfileComponent implements OnInit {
  posts = signal<PostResponse[]>([]);
  stats = signal<PublicUserCard | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    public auth: AuthService,
    private postsService: PostsService,
    private usersApi: UsersApiService,
  ) {}

  async ngOnInit() {
    try {
      const me = this.auth.currentUser();
      const [data, profile] = await Promise.all([
        this.postsService.getMyPosts(),
        me ? this.usersApi.getProfile(me.id) : Promise.resolve(null),
      ]);
      this.posts.set(data);
      this.stats.set(profile);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async deletePost(id: number) {
    try {
      await this.postsService.deletePost(id);
      this.posts.update((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  formatDate(iso: string): string {
    return iso.slice(0, 10);
  }
}
