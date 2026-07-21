import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostResponse } from '../posts/posts.service';
import { PublicUserCard, UsersApiService } from './users-api.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/search" class="back-link">← Search</a>

    @if (loading()) {
      <p class="muted">Loading profile…</p>
    } @else if (error()) {
      <p class="form-error">{{ error() }}</p>
    } @else if (profile()) {
      <div class="profile-header">
        @if (profile()!.avatarUrl) {
          <img
            class="avatar-round"
            [src]="profile()!.avatarUrl!"
            width="72"
            height="72"
            alt=""
          />
        }
        <div style="flex:1;">
          <h1>{{ profile()!.username }}</h1>
          <p class="muted" style="margin:0.5rem 0 0;">
            {{ profile()!.followerCount ?? 0 }} followers · {{ profile()!.followingCount ?? 0 }} following
            @if (profile()!.isFriend) {
              <span class="badge-friend">Friends</span>
            }
          </p>
        </div>
        @if (!isSelf()) {
          @if (profile()!.amIFollowing || profile()!.isFriend) {
            <button type="button" class="btn btn-ghost" (click)="unfollow()">
              {{ profile()!.isFriend ? 'Friends · Unfollow' : 'Following' }}
            </button>
          } @else {
            <button type="button" class="btn btn-primary" (click)="follow()">Follow</button>
          }
        } @else {
          <a routerLink="/profile" class="btn btn-ghost">My posts</a>
        }
      </div>

      <h2 style="font-size:1.15rem; margin:2rem 0 1rem;">Posts</h2>
      @if (posts().length === 0) {
        <p class="empty">No posts yet.</p>
      } @else {
        <ul style="list-style:none; padding:0; margin:0;">
          @for (post of posts(); track post.id) {
            <li class="post-card">
              <small class="muted">{{ formatDate(post.createdAt) }}</small>
              @if (post.description) {
                <p style="margin:0.5rem 0 0.75rem;">{{ post.description }}</p>
              }
              @for (song of post.songs; track song.id) {
                <div class="song-row">
                  @if (song.albumImageUrl) {
                    <img [src]="song.albumImageUrl" width="48" height="48" alt="" />
                  }
                  <div>
                    <strong>{{ song.trackName }}</strong><br />
                    <small class="muted">{{ song.artistName }} — {{ song.albumName }}</small>
                  </div>
                </div>
              }
            </li>
          }
        </ul>
      }
    }
  `,
})
export class UserProfileComponent implements OnInit {
  profile = signal<PublicUserCard | null>(null);
  posts = signal<PostResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  isSelf = signal(false);

  private userId = 0;

  constructor(
    private route: ActivatedRoute,
    private usersApi: UsersApiService,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.userId) {
      this.error.set('Invalid user.');
      this.loading.set(false);
      return;
    }

    this.isSelf.set(this.auth.currentUser()?.id === this.userId);

    try {
      const [profile, posts] = await Promise.all([
        this.usersApi.getProfile(this.userId),
        this.usersApi.getUserPosts(this.userId),
      ]);
      this.profile.set(profile);
      this.posts.set(posts);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async follow() {
    try {
      this.profile.set(await this.usersApi.follow(this.userId));
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  async unfollow() {
    try {
      this.profile.set(await this.usersApi.unfollow(this.userId));
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  formatDate(iso: string): string {
    return iso.slice(0, 10);
  }
}
