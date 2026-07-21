import { Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { APP_CONFIG, AppConfig } from '../core/app-config';

export interface SongEntryPayload {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl?: string;
  position: number;
  description?: string;
}

export interface CreatePostPayload {
  description?: string;
  songs: SongEntryPayload[];
}

export interface SongEntryResponse {
  id: number;
  postId: number;
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  albumImageUrl: string | null;
  position: number;
  description: string | null;
}

export interface PostResponse {
  id: number;
  userId: number;
  description: string | null;
  songs: SongEntryResponse[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(
    private auth: AuthService,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {}

  private get apiUrl(): string {
    return `${this.config.apiBaseUrl}/posts`;
  }

  async createPost(payload: CreatePostPayload): Promise<PostResponse> {
    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.auth.getToken()}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to create post.');
    return data;
  }

  async getMyPosts(): Promise<PostResponse[]> {
    const res = await fetch(`${this.apiUrl}/mine`, {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to load posts.');
    return data;
  }

  async deletePost(id: number): Promise<void> {
    const res = await fetch(`${this.apiUrl}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.auth.getToken()}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message ?? 'Failed to delete post.');
    }
  }
}
