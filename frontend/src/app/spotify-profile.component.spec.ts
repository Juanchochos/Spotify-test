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
    mockAuth.getToken = () => 'jwt-token';
    mockSpotify = {
      getStatus: vi.fn().mockResolvedValue({ connected: false, profile: null }),
      redirectToAuthCodeFlow: vi.fn(),
      completeLogin: vi.fn(),
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

  it('shows profile from Nest status when connected', async () => {
    (mockSpotify.getStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      connected: true,
      profile: { display_name: 'Alice', id: 'sp1' },
    });

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Alice');
    expect(fixture.nativeElement.textContent).toContain('Go to Dashboard');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('starts oauth when not connected and no code', async () => {
    vi.stubGlobal('location', { search: '' });

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();

    expect(mockSpotify.redirectToAuthCodeFlow).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('exchanges oauth code via Nest callback', async () => {
    const profile = { display_name: 'Carol', id: 'sp3' };
    vi.stubGlobal('location', { search: '?code=auth-code' });
    vi.stubGlobal('history', { replaceState: vi.fn() });
    (mockSpotify.completeLogin as ReturnType<typeof vi.fn>).mockResolvedValue(profile);

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(mockSpotify.completeLogin).toHaveBeenCalledWith('auth-code');
    expect(fixture.nativeElement.textContent).toContain('Carol');

    vi.unstubAllGlobals();
  });

  it('shows error when oauth exchange fails', async () => {
    vi.stubGlobal('location', { search: '?code=bad-code' });
    (mockSpotify.completeLogin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('token failed'),
    );

    const fixture = TestBed.createComponent(SpotifyProfileComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Unable to complete Spotify login');

    vi.unstubAllGlobals();
  });
});
