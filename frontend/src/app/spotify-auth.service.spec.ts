import { TestBed } from '@angular/core/testing';
import { SpotifyAuthService } from './spotify-auth.service';
import { AuthService } from './auth/auth.service';
import { provideTestProviders } from './testing/provide-test-providers';
import { setupMockLocalStorage } from './testing/mock-local-storage';
import { createMockAuthService } from './testing/mock-auth.service';
import { mockAppConfig } from './testing/mock-app-config';

describe('SpotifyAuthService', () => {
  let service: SpotifyAuthService;
  let fetchMock: ReturnType<typeof vi.fn>;
  let mockAuth: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    setupMockLocalStorage();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    mockAuth = createMockAuthService();
    mockAuth.getToken = () => 'jwt-token';

    TestBed.configureTestingModule({
      providers: [
        ...provideTestProviders(),
        { provide: AuthService, useValue: mockAuth },
        SpotifyAuthService,
      ],
    });

    service = TestBed.inject(SpotifyAuthService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getStatus returns connected from Nest', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, profile: { id: 'sp1' } }),
    });

    const status = await service.getStatus();

    expect(status.connected).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/spotify/status`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
    expect(localStorage.getItem('spotify_profile')).toContain('sp1');
  });

  it('isConnected returns false when status request fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    expect(await service.isConnected()).toBe(false);
  });

  it('searchTracks calls Nest search endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 't1', name: 'Song' }],
    });

    const tracks = await service.searchTracks('hello');

    expect(tracks).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/spotify/search?q=hello`,
      expect.any(Object),
    );
  });

  it('searchTracks throws on 401', async () => {
    fetchMock.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ message: 'Spotify session expired. Please reconnect Spotify.' }),
    });

    await expect(service.searchTracks('hello')).rejects.toThrow(
      'Spotify session expired. Please reconnect Spotify.',
    );
  });

  it('completeLogin posts code and verifier to Nest', async () => {
    localStorage.setItem('spotify_code_verifier', 'verifier-xyz');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, profile: { display_name: 'Alice' } }),
    });

    const profile = await service.completeLogin('auth-code');

    expect(profile.display_name).toBe('Alice');
    expect(localStorage.getItem('spotify_code_verifier')).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/spotify/callback`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'auth-code', codeVerifier: 'verifier-xyz' }),
      }),
    );
  });

  it('disconnect clears local cache and calls Nest', async () => {
    localStorage.setItem('spotify_profile', '{}');
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    await service.disconnect();

    expect(localStorage.getItem('spotify_profile')).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/spotify/disconnect`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
