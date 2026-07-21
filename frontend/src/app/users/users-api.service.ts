import { Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { APP_CONFIG, AppConfig } from '../core/app-config';
import { PostResponse } from '../posts/posts.service';

export interface PublicUserCard {
  id: number;
  username: string;
  avatarUrl: string | null;
  amIFollowing: boolean;
  isFriend: boolean;
  followerCount?: number;
  followingCount?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  constructor(
    private auth: AuthService,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {}

  private get apiUrl(): string {
    return `${this.config.apiBaseUrl}/users`;
  }

  private headers(): HeadersInit {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  async search(q: string): Promise<PublicUserCard[]> {
    const params = new URLSearchParams({ q });
    const res = await fetch(`${this.apiUrl}/search?${params}`, {
      headers: this.headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Search failed.');
    return data;
  }

  async getProfile(id: number): Promise<PublicUserCard> {
    const res = await fetch(`${this.apiUrl}/${id}`, { headers: this.headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to load profile.');
    return data;
  }

  async getUserPosts(id: number): Promise<PostResponse[]> {
    const res = await fetch(`${this.apiUrl}/${id}/posts`, { headers: this.headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to load posts.');
    return data;
  }

  async follow(id: number): Promise<PublicUserCard> {
    const res = await fetch(`${this.apiUrl}/${id}/follow`, {
      method: 'POST',
      headers: this.headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Follow failed.');
    return data;
  }

  async unfollow(id: number): Promise<PublicUserCard> {
    const res = await fetch(`${this.apiUrl}/${id}/follow`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Unfollow failed.');
    return data;
  }

  async getFollowing(): Promise<PublicUserCard[]> {
    return this.getList('me/following');
  }

  async getFollowers(): Promise<PublicUserCard[]> {
    return this.getList('me/followers');
  }

  async getFriends(): Promise<PublicUserCard[]> {
    return this.getList('me/friends');
  }

  private async getList(path: string): Promise<PublicUserCard[]> {
    const res = await fetch(`${this.apiUrl}/${path}`, { headers: this.headers() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Failed to load list.');
    return data;
  }
}
