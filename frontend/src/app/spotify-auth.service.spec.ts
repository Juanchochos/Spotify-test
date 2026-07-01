import { TestBed } from '@angular/core/testing';
import { SpotifyAuthService } from './spotify-auth.service';
import { provideTestProviders } from './testing/provide-test-providers';
import { setupMockLocalStorage } from './testing/mock-local-storage';

describe('SpotifyAuthService', () => {
  let service: SpotifyAuthService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setupMockLocalStorage();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [...provideTestProviders(), SpotifyAuthService],
    });

    service = TestBed.inject(SpotifyAuthService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isConnected returns false when token expired', () => {
    localStorage.setItem('spotify_access_token', 'tok');
    localStorage.setItem('spotify_token_expiry', String(Date.now() - 1000));

    expect(service.isConnected()).toBe(false);
  });

  it('isConnected returns true when token is valid', () => {
    localStorage.setItem('spotify_access_token', 'tok');
    localStorage.setItem('spotify_token_expiry', String(Date.now() + 3600000));

    expect(service.isConnected()).toBe(true);
  });

  it('searchTracks throws when no token', async () => {
    await expect(service.searchTracks('hello')).rejects.toThrow(
      'No Spotify access token available.',
    );
  });

  it('searchTracks disconnects and throws on 401', async () => {
    localStorage.setItem('spotify_access_token', 'tok');
    localStorage.setItem('spotify_token_expiry', String(Date.now() + 3600000));
    fetchMock.mockResolvedValue({ status: 401, ok: false });

    await expect(service.searchTracks('hello')).rejects.toThrow(
      'Spotify session expired. Please reconnect Spotify.',
    );
    expect(localStorage.getItem('spotify_access_token')).toBeNull();
  });

  it('disconnect clears stored spotify data', () => {
    localStorage.setItem('spotify_access_token', 'tok');
    localStorage.setItem('spotify_token_expiry', '9999');
    localStorage.setItem('spotify_profile', '{}');

    service.disconnect();

    expect(localStorage.getItem('spotify_access_token')).toBeNull();
    expect(localStorage.getItem('spotify_token_expiry')).toBeNull();
    expect(localStorage.getItem('spotify_profile')).toBeNull();
  });
});
