import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SpotifyProfileComponent } from './spotify-profile.component';
import { SpotifyAuthService } from './spotify-auth.service';
import { AuthService } from './auth/auth.service';
import { createMockAuthService } from './testing/mock-auth.service';

describe('SpotifyProfileComponent', () => {
  let mockSpotify: Partial<SpotifyAuthService>;
  let mockAuth: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuth = createMockAuthService();
    mockSpotify = {
      isConnected: vi.fn().mockReturnValue(false),
      getStoredProfile: vi.fn().mockReturnValue(null),
      loadProfileFromBackend: vi.fn().mockResolvedValue(null),
      redirectToAuthCodeFlow: vi.fn(),
      getAccessToken: vi.fn(),
      fetchProfile: vi.fn(),
      saveProfileToBackend: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [SpotifyProfileComponent],
      providers: [
        provideRouter([]),
        { provide: SpotifyAuthService, useValue: mockSpotify },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();
  });

  it('shows cached profile when spotify is connected locally', async () => {
    (mockSpotify.isConnected as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (mockSpotify.getStoredProfile as ReturnType<typeof vi.fn>).mockReturnValue({
      display_name: 'Alice',
      id: 'sp1',
    });

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alice');
    expect(fixture.nativeElement.textContent).toContain('Go to Dashboard');
    expect(fixture.nativeElement.textContent).toContain('View My Posts');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('loads profile from backend when no local cache', async () => {
    mockAuth.getToken = () => 'jwt-token';
    (mockSpotify.loadProfileFromBackend as ReturnType<typeof vi.fn>).mockResolvedValue({
      display_name: 'Bob',
      id: 'sp2',
    });

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(mockSpotify.loadProfileFromBackend).toHaveBeenCalledWith('jwt-token');
    expect(fixture.nativeElement.textContent).toContain('Bob');
  });

  it('exchanges oauth code and saves profile', async () => {
    mockAuth.getToken = () => 'jwt-token';
    const profile = { display_name: 'Carol', id: 'sp3' };

    vi.stubGlobal('location', { search: '?code=auth-code' });
    (mockSpotify.getAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue('spotify-token');
    (mockSpotify.fetchProfile as ReturnType<typeof vi.fn>).mockResolvedValue(profile);

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(mockSpotify.getAccessToken).toHaveBeenCalledWith('auth-code');
    expect(mockSpotify.saveProfileToBackend).toHaveBeenCalledWith('jwt-token', profile);
    expect(fixture.nativeElement.textContent).toContain('Carol');

    vi.unstubAllGlobals();
  });

  it('shows error when oauth exchange fails', async () => {
    vi.stubGlobal('location', { search: '?code=bad-code' });
    (mockSpotify.getAccessToken as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('token failed'),
    );

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to load Spotify profile');

    vi.unstubAllGlobals();
  });
});
