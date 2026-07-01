import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from './auth.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('LoginComponent', () => {
  let mockAuth: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuth = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }],
    }).compileComponents();
  });

  it('calls auth.login on submit', async () => {
    const loginSpy = vi.fn().mockResolvedValue(undefined);
    mockAuth.login = loginSpy;

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.email = 'a@b.com';
    fixture.componentInstance.password = 'password';
    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(loginSpy).toHaveBeenCalledWith('a@b.com', 'password');
  });

  it('shows error message on login failure', async () => {
    mockAuth.login = vi.fn().mockRejectedValue(new Error('Invalid credentials.'));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.email = 'a@b.com';
    fixture.componentInstance.password = 'wrong';
    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Invalid credentials.');
  });

  it('disables button while loading', async () => {
    let resolveLogin!: () => void;
    mockAuth.login = vi.fn(
      () => new Promise<void>((resolve) => { resolveLogin = resolve; }),
    );

    const fixture = TestBed.createComponent(LoginComponent);
    const submitPromise = fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    resolveLogin();
    await submitPromise;
  });
});
