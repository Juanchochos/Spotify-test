import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('authGuard', () => {
  let mockAuth: ReturnType<typeof createMockAuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuth = createMockAuthService();

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuth }],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('allows access when logged in', () => {
    mockAuth.isLoggedIn = () => true;

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('redirects to login when not logged in', () => {
    mockAuth.isLoggedIn = () => false;

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
