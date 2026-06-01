import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PostsService, PostResponse } from './posts.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main style="max-width:680px; margin:60px auto; font-family:sans-serif; padding:0 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <h1 style="margin:0;">{{ auth.currentUser()?.username }}'s Profile</h1>
        <a routerLink="/create-post" style="padding:8px 16px; text-decoration:none; border:1px solid #ccc; border-radius:4px;">
          + New Post
        </a>
      </div>
      <a routerLink="/dashboard" style="font-size:0.9rem; display:inline-block; margin-top:8px;">&larr; Back to Dashboard</a>

      @if (loading()) {
        <p style="margin-top:24px;">Loading posts...</p>
      } @else if (error()) {
        <p style="color:crimson; margin-top:24px;">{{ error() }}</p>
      } @else if (posts().length === 0) {
        <p style="margin-top:32px; color:#888;">
          No posts yet. <a routerLink="/create-post">Create your first post!</a>
        </p>
      } @else {
        <ul style="list-style:none; padding:0; margin-top:24px;">
          @for (post of posts(); track post.id) {
            <li style="border:1px solid #ddd; border-radius:8px; padding:16px; margin-bottom:20px;">

              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <small style="color:#888;">{{ formatDate(post.createdAt) }}</small>
                <button
                  (click)="deletePost(post.id)"
                  style="color:crimson; background:none; border:none; cursor:pointer; font-size:0.85rem; padding:0;"
                >
                  Delete
                </button>
              </div>

              @if (post.description) {
                <p style="margin:0 0 12px;">{{ post.description }}</p>
              }

              @if (post.songs.length === 0) {
                <p style="color:#aaa; font-style:italic; margin:0;">No songs in this post.</p>
              } @else {
                <ul style="list-style:none; padding:0; margin:0;">
                  @for (song of post.songs; track song.id) {
                    <li style="display:flex; align-items:flex-start; gap:12px; padding:8px 0; border-bottom:1px solid #f0f0f0;">
                      @if (song.albumImageUrl) {
                        <img [src]="song.albumImageUrl" width="48" height="48" style="border-radius:4px; flex-shrink:0;" />
                      }
                      <div>
                        <strong>{{ song.trackName }}</strong><br />
                        <small style="color:#555;">{{ song.artistName }} &mdash; {{ song.albumName }}</small>
                        @if (song.description) {
                          <p style="margin:4px 0 0; font-size:0.85rem; color:#666;">{{ song.description }}</p>
                        }
                      </div>
                    </li>
                  }
                </ul>
              }

            </li>
          }
        </ul>
      }
    </main>
  `,
})
export class ProfileComponent implements OnInit {
  posts = signal<PostResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(public auth: AuthService, private postsService: PostsService) {}

  async ngOnInit() {
    try {
      const data = await this.postsService.getMyPosts();
      this.posts.set(data);
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
