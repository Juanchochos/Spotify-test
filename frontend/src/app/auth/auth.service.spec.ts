import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { provideTestProviders } from '../testing/provide-test-providers';
import { mockAppConfig } from '../testing/mock-app-config';
import { setupMockLocalStorage } from '../testing/mock-local-storage';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setupMockLocalStorage();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [...provideTestProviders(), AuthService],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('login saves token and user on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'jwt-token',
        user: { id: 1, email: 'a@b.com', username: 'alice' },
      }),
    });

    await service.login('a@b.com', 'password');

    expect(fetchMock).toHaveBeenCalledWith(
      `${mockAppConfig.apiBaseUrl}/auth/login`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(service.getToken()).toBe('jwt-token');
    expect(service.currentUser()?.username).toBe('alice');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('login throws on failure', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials.' }),
    });

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow('Invalid credentials.');
  });

  it('register saves session on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'jwt-token',
        user: { id: 2, email: 'b@c.com', username: 'bob' },
      }),
    });

    await service.register('b@c.com', 'bob', 'password123');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.username).toBe('bob');
  });

  it('logout clears session and navigates to login', () => {
    localStorage.setItem('auth_token', 'jwt-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'a@b.com', username: 'alice' }));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
