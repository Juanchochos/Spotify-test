import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CreatePostComponent } from './create-post.component';
import { SpotifyAuthService, SpotifyTrack } from '../spotify-auth.service';
import { PostsService } from './posts.service';
import { AuthService } from '../auth/auth.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('CreatePostComponent', () => {
  let mockSpotify: Partial<SpotifyAuthService>;
  let mockPosts: Partial<PostsService>;
  let router: Router;

  const sampleTrack: SpotifyTrack = {
    id: 'track-1',
    name: 'Test Song',
    artists: [{ name: 'Test Artist' }],
    album: { name: 'Test Album', images: [{ url: 'img.jpg', width: 64, height: 64 }] },
    external_urls: { spotify: 'https://spotify.com' },
    duration_ms: 180000,
  };

  beforeEach(async () => {
    mockSpotify = {
      isConnected: vi.fn().mockResolvedValue(true),
      searchTracks: vi.fn().mockResolvedValue([sampleTrack]),
      redirectToAuthCodeFlow: vi.fn(),
    };
    mockPosts = {
      createPost: vi.fn().mockResolvedValue({ id: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [CreatePostComponent],
      providers: [
        provideRouter([]),
        { provide: SpotifyAuthService, useValue: mockSpotify },
        { provide: PostsService, useValue: mockPosts },
        { provide: AuthService, useValue: createMockAuthService() },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('shows connect spotify prompt when not connected', async () => {
    (mockSpotify.isConnected as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const fixture = TestBed.createComponent(CreatePostComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('connect Spotify');
  });

  it('search populates results', async () => {
    const fixture = TestBed.createComponent(CreatePostComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.componentInstance.searchQuery = 'test';
    await fixture.componentInstance.search();
    fixture.detectChanges();

    expect(mockSpotify.searchTracks).toHaveBeenCalledWith('test');
    expect(fixture.componentInstance.searchResults().length).toBe(1);
  });

  it('addSong enforces 5-song limit', () => {
    const fixture = TestBed.createComponent(CreatePostComponent);
    for (let i = 0; i < 5; i++) {
      fixture.componentInstance.addSong({ ...sampleTrack, id: `track-${i}` });
    }
    fixture.componentInstance.addSong({ ...sampleTrack, id: 'track-extra' });

    expect(fixture.componentInstance.selectedSongs().length).toBe(5);
  });

  it('submit calls postsService and navigates to profile', async () => {
    const fixture = TestBed.createComponent(CreatePostComponent);
    fixture.componentInstance.addSong(sampleTrack);

    await fixture.componentInstance.submit();

    expect(mockPosts.createPost).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });
});
