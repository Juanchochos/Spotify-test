import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from './auth.service';
import { SpotifyAuthService } from '../spotify-auth.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('DashboardComponent', () => {
  let mockAuth: ReturnType<typeof createMockAuthService>;
  let mockSpotify: Partial<SpotifyAuthService>;

  beforeEach(async () => {
    mockAuth = createMockAuthService();
    mockAuth.currentUser.set({ id: 1, email: 'a@b.com', username: 'alice' });
    mockAuth.getToken = () => 'jwt-token';

    mockSpotify = {
      getStatus: vi.fn().mockResolvedValue({ connected: false, profile: null }),
      redirectToAuthCodeFlow: vi.fn(),
      disconnect: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        { provide: SpotifyAuthService, useValue: mockSpotify },
      ],
    }).compileComponents();
  });

  it('shows connect spotify button when not linked', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Connect Spotify');
    expect(fixture.nativeElement.textContent).toContain('Create Post');
    expect(fixture.nativeElement.textContent).toContain('My Profile');
  });

  it('shows disconnect when spotify is linked', async () => {
    (mockSpotify.getStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      connected: true,
      profile: { id: 'sp1' },
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    await fixture.componentInstance.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Disconnect Spotify');
  });

  it('connectSpotify starts oauth flow', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.connectSpotify();
    expect(mockSpotify.redirectToAuthCodeFlow).toHaveBeenCalled();
  });

  it('disconnectSpotify clears spotify link', async () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.componentInstance.spotifyLinked.set(true);

    await fixture.componentInstance.disconnectSpotify();

    expect(mockSpotify.disconnect).toHaveBeenCalled();
    expect(fixture.componentInstance.spotifyLinked()).toBe(false);
  });
});
