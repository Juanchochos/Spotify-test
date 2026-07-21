import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpotifyAuthService, SpotifyTrack } from '../spotify-auth.service';
import { PostsService, SongEntryPayload } from './posts.service';
import { AuthService } from '../auth/auth.service';

interface SelectedSong extends SongEntryPayload {
  displayName: string;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/dashboard" class="back-link">← Dashboard</a>
    <h1 class="page-title">Create post</h1>
    <p class="page-lead">Up to five songs, with optional notes.</p>

    @if (checkingSpotify()) {
      <p class="muted">Checking Spotify connection…</p>
    } @else if (!spotifyConnected()) {
      <div class="panel">
        <p style="margin:0 0 1rem;">Connect Spotify to search for songs.</p>
        <button type="button" class="btn btn-primary" (click)="connectSpotify()">Connect Spotify</button>
      </div>
    } @else {
      <section>
        <h2 style="font-size:1.15rem; margin-bottom:1rem;">
          Songs ({{ selectedSongs().length }}/5)
        </h2>

        @if (selectedSongs().length < 5) {
          <div class="search-bar">
            <input
              class="input"
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search Spotify…"
              (keyup.enter)="search()"
            />
            <button type="button" class="btn btn-ghost" (click)="search()" [disabled]="searching()">
              {{ searching() ? 'Searching…' : 'Search' }}
            </button>
          </div>

          @if (searchError()) {
            <p class="form-error">{{ searchError() }}</p>
          }

          @if (searchResults().length > 0) {
            <ul class="panel" style="list-style:none; margin:0 0 1.5rem; padding:0; max-height:300px; overflow-y:auto;">
              @for (track of searchResults(); track track.id) {
                <li class="song-row" style="border-top:none; border-bottom:1px solid var(--line); padding-inline:0.75rem;">
                  @if (track.album.images[0]) {
                    <img [src]="track.album.images[0].url" width="48" height="48" alt="" />
                  }
                  <div style="flex:1; min-width:0;">
                    <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ track.name }}</strong>
                    <small class="muted">{{ track.artists[0]?.name }} — {{ track.album.name }}</small>
                  </div>
                  <button
                    type="button"
                    class="btn btn-ghost"
                    style="padding:0.4rem 0.75rem;"
                    (click)="addSong(track)"
                    [disabled]="isAlreadyAdded(track.id)"
                  >
                    {{ isAlreadyAdded(track.id) ? 'Added' : '+ Add' }}
                  </button>
                </li>
              }
            </ul>
          }
        }

        @if (selectedSongs().length > 0) {
          <ul style="list-style:none; padding:0; margin:0 0 1.5rem;">
            @for (song of selectedSongs(); track song.spotifyTrackId; let i = $index) {
              <li class="post-card" style="margin-bottom:0.75rem; padding:1rem;">
                <div class="song-row" style="border:none; padding:0;">
                  @if (song.albumImageUrl) {
                    <img [src]="song.albumImageUrl" width="48" height="48" alt="" />
                  }
                  <div style="flex:1;">
                    <strong>{{ song.trackName }}</strong>
                    <span class="muted"> — {{ song.artistName }}</span>
                  </div>
                  <button type="button" class="btn-danger" (click)="removeSong(i)">Remove</button>
                </div>
                <div class="field" style="margin-top:0.75rem;">
                  <input
                    class="input"
                    type="text"
                    [(ngModel)]="song.description"
                    maxlength="300"
                    placeholder="Note for this song (optional)"
                  />
                </div>
              </li>
            }
          </ul>
        }
      </section>

      <div class="field">
        <label for="desc">Post description (optional)</label>
        <textarea
          id="desc"
          class="input"
          [(ngModel)]="postDescription"
          maxlength="500"
          rows="3"
          placeholder="What's on your mind?"
        ></textarea>
      </div>

      @if (submitError()) {
        <p class="form-error">{{ submitError() }}</p>
      }

      <div class="btn-row" style="margin-top:1.25rem;">
        <button type="button" class="btn btn-primary" (click)="submit()" [disabled]="submitting()">
          {{ submitting() ? 'Posting…' : 'Post' }}
        </button>
        <a routerLink="/profile" class="btn btn-ghost">View profile</a>
      </div>
    }
  `,
})
export class CreatePostComponent implements OnInit {
  searchQuery = '';
  postDescription = '';

  searchResults = signal<SpotifyTrack[]>([]);
  selectedSongs = signal<SelectedSong[]>([]);
  searching = signal(false);
  searchError = signal<string | null>(null);
  submitting = signal(false);
  submitError = signal<string | null>(null);
  spotifyConnected = signal(false);
  checkingSpotify = signal(true);

  constructor(
    public spotifyAuth: SpotifyAuthService,
    private postsService: PostsService,
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    try {
      this.spotifyConnected.set(await this.spotifyAuth.isConnected());
    } catch {
      this.spotifyConnected.set(false);
    } finally {
      this.checkingSpotify.set(false);
    }
  }

  connectSpotify() {
    this.spotifyAuth.redirectToAuthCodeFlow();
  }

  async search() {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.searchError.set(null);
    this.searching.set(true);
    try {
      const results = await this.spotifyAuth.searchTracks(q);
      this.searchResults.set(results);
    } catch (err: any) {
      this.searchError.set(err.message);
    } finally {
      this.searching.set(false);
    }
  }

  addSong(track: SpotifyTrack) {
    if (this.selectedSongs().length >= 5) return;
    const song: SelectedSong = {
      spotifyTrackId: track.id,
      trackName: track.name,
      artistName: track.artists[0]?.name ?? '',
      albumName: track.album.name,
      albumImageUrl: track.album.images[0]?.url,
      position: this.selectedSongs().length,
      description: undefined,
      displayName: `${track.name} – ${track.artists[0]?.name ?? ''}`,
    };
    this.selectedSongs.update((prev) => [...prev, song]);
  }

  removeSong(index: number) {
    this.selectedSongs.update((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i })),
    );
  }

  isAlreadyAdded(trackId: string): boolean {
    return this.selectedSongs().some((s) => s.spotifyTrackId === trackId);
  }

  async submit() {
    this.submitError.set(null);
    this.submitting.set(true);
    try {
      await this.postsService.createPost({
        description: this.postDescription.trim() || undefined,
        songs: this.selectedSongs().map(({ displayName, ...rest }) => rest),
      });
      this.router.navigate(['/profile']);
    } catch (err: any) {
      this.submitError.set(err.message);
    } finally {
      this.submitting.set(false);
    }
  }
}
