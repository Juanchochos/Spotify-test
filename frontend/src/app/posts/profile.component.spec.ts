import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { PostsService, PostResponse } from './posts.service';
import { AuthService } from '../auth/auth.service';
import { UsersApiService } from '../users/users-api.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('ProfileComponent', () => {
  let mockPosts: Partial<PostsService>;
  let mockUsers: Partial<UsersApiService>;
  let mockAuth: ReturnType<typeof createMockAuthService>;

  const samplePost: PostResponse = {
    id: 1,
    userId: 1,
    description: 'My post',
    createdAt: '2026-01-01T00:00:00.000Z',
    songs: [
      {
        id: 10,
        postId: 1,
        spotifyTrackId: 't1',
        trackName: 'Song',
        artistName: 'Artist',
        albumName: 'Album',
        albumImageUrl: null,
        position: 0,
        description: null,
      },
    ],
  };

  beforeEach(async () => {
    mockAuth = createMockAuthService();
    mockAuth.currentUser.set({ id: 1, email: 'a@b.com', username: 'alice' });

    mockPosts = {
      getMyPosts: vi.fn().mockResolvedValue([samplePost]),
      deletePost: vi.fn().mockResolvedValue(undefined),
    };
    mockUsers = {
      getProfile: vi.fn().mockResolvedValue({
        id: 1,
        username: 'alice',
        avatarUrl: null,
        amIFollowing: false,
        isFriend: false,
        followerCount: 2,
        followingCount: 3,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        { provide: PostsService, useValue: mockPosts },
        { provide: UsersApiService, useValue: mockUsers },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();
  });

  it('loads and displays posts on init', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(mockPosts.getMyPosts).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('My post');
    expect(fixture.nativeElement.textContent).toContain('Song');
  });

  it('shows empty state when no posts', async () => {
    (mockPosts.getMyPosts as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const fixture = TestBed.createComponent(ProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No posts yet');
  });

  it('deletePost removes post from list', async () => {
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.componentInstance.posts.set([samplePost]);

    await fixture.componentInstance.deletePost(1);

    expect(mockPosts.deletePost).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.posts().length).toBe(0);
  });
});
