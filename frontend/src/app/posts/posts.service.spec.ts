import { TestBed } from '@angular/core/testing';
import { PostsService } from './posts.service';
import { AuthService } from '../auth/auth.service';
import { provideTestProviders } from '../testing/provide-test-providers';
import { mockAppConfig } from '../testing/mock-app-config';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('PostsService', () => {
  let service: PostsService;
  let fetchMock: ReturnType<typeof vi.fn>;
  const mockAuth = createMockAuthService({ getToken: () => 'jwt-token' });

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [
        ...provideTestProviders(),
        PostsService,
        { provide: AuthService, useValue: mockAuth },
      ],
    });

    service = TestBed.inject(PostsService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createPost sends payload with auth header', async () => {
    const payload = { description: 'test', songs: [] };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, ...payload }),
    });

    await service.createPost(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/posts`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-token' }),
      }),
    );
  });

  it('getMyPosts fetches from mine endpoint', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    await service.getMyPosts();

    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/posts/mine`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer jwt-token' },
      }),
    );
  });

  it('deletePost sends DELETE request', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) });

    await service.deletePost(5);

    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/posts/5`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
