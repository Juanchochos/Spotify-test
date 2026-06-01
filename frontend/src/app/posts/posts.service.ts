import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const API = 'http://127.0.0.1:3000/api/posts';

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
  constructor(private auth: AuthService) {}

  async createPost(payload: CreatePostPayload): Promise<PostResponse> {
    const res = await fetch(API, {
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
    const res = await fetch(`${API}/mine`, {
      headers: { Authorization: `Bearer ${this.auth.getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to load posts.');
    return data;
  }

  async deletePost(id: number): Promise<void> {
    const res = await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.auth.getToken()}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message ?? 'Failed to delete post.');
    }
  }
}
