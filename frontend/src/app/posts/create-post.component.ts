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
    <main style="max-width:680px; margin:60px auto; font-family:sans-serif; padding:0 16px;">
      <h1>Create Post</h1>
      <a routerLink="/dashboard" style="font-size:0.9rem;">&larr; Back to Dashboard</a>

      @if (checkingSpotify()) {
        <p style="margin-top:24px;">Checking Spotify connection...</p>
      } @else if (!spotifyConnected()) {
        <div style="margin-top:24px; padding:16px; border:1px solid #f0a; border-radius:6px;">
          <p>You need to connect Spotify to search for songs.</p>
          <button (click)="connectSpotify()" style="padding:8px 16px;">Connect Spotify</button>
        </div>
      } @else {

        <section style="margin-top:24px;">
          <h2 style="margin-bottom:12px;">Add Songs ({{ selectedSongs().length }}/5)</h2>

          @if (selectedSongs().length < 5) {
            <div style="display:flex; gap:8px; margin-bottom:12px;">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search Spotify..."
                style="flex:1; padding:8px; font-size:14px;"
                (keyup.enter)="search()"
              />
              <button (click)="search()" [disabled]="searching()" style="padding:8px 16px;">
                {{ searching() ? 'Searching...' : 'Search' }}
              </button>
            </div>

            @if (searchError()) {
              <p style="color:crimson;">{{ searchError() }}</p>
            }

            @if (searchResults().length > 0) {
              <ul style="list-style:none; padding:0; border:1px solid #ddd; border-radius:6px; max-height:300px; overflow-y:auto; margin-bottom:16px;">
                @for (track of searchResults(); track track.id) {
                  <li style="display:flex; align-items:center; gap:12px; padding:8px 12px; border-bottom:1px solid #eee;">
                    @if (track.album.images[0]) {
                      <img [src]="track.album.images[0].url" width="48" height="48" style="border-radius:4px; flex-shrink:0;" />
                    }
                    <div style="flex:1; min-width:0;">
                      <strong style="display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ track.name }}</strong>
                      <small>{{ track.artists[0]?.name }} &mdash; {{ track.album.name }}</small>
                    </div>
                    <button
                      (click)="addSong(track)"
                      [disabled]="isAlreadyAdded(track.id)"
                      style="flex-shrink:0; padding:6px 12px;"
                    >
                      {{ isAlreadyAdded(track.id) ? 'Added' : '+ Add' }}
                    </button>
                  </li>
                }
              </ul>
            }
          }

          @if (selectedSongs().length > 0) {
            <ul style="list-style:none; padding:0;">
              @for (song of selectedSongs(); track song.spotifyTrackId; let i = $index) {
                <li style="padding:12px; margin-bottom:8px; border:1px solid #ccc; border-radius:6px;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    @if (song.albumImageUrl) {
                      <img [src]="song.albumImageUrl" width="48" height="48" style="border-radius:4px; flex-shrink:0;" />
                    }
                    <div style="flex:1; min-width:0;">
                      <strong>{{ song.trackName }}</strong> &mdash; {{ song.artistName }}
                    </div>
                    <button (click)="removeSong(i)" style="color:crimson; background:none; border:none; cursor:pointer; flex-shrink:0;">
                      Remove
                    </button>
                  </div>
                  <div style="margin-top:8px;">
                    <input
                      type="text"
                      [(ngModel)]="song.description"
                      maxlength="300"
                      placeholder="Note for this song (optional)"
                      style="width:100%; padding:6px; box-sizing:border-box; font-size:13px;"
                    />
                  </div>
                </li>
              }
            </ul>
          }
        </section>

        <section style="margin-top:24px;">
          <label style="display:block;">
            Post description (optional)
            <textarea
              [(ngModel)]="postDescription"
              maxlength="500"
              rows="3"
              placeholder="What's on your mind?"
              style="width:100%; padding:8px; box-sizing:border-box; margin-top:6px; font-size:14px;"
            ></textarea>
          </label>
        </section>

        @if (submitError()) {
          <p style="color:crimson; margin-top:12px;">{{ submitError() }}</p>
        }

        <div style="margin-top:20px; display:flex; gap:12px; align-items:center;">
          <button
            (click)="submit()"
            [disabled]="submitting()"
            style="padding:10px 24px; font-size:15px;"
          >
            {{ submitting() ? 'Posting...' : 'Post' }}
          </button>
          <a routerLink="/profile" style="padding:10px 16px; text-decoration:none; border:1px solid #ccc; border-radius:4px; font-size:14px;">
            View Profile
          </a>
        </div>

      }
    </main>
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
