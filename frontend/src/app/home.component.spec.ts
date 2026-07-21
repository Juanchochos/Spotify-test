import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthService } from './auth/auth.service';
import { createMockAuthService } from './testing/mock-auth.service';

describe('HomeComponent', () => {
  let mockAuth: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuth = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }],
    }).compileComponents();
  });

  it('shows login and register links when logged out', () => {
    mockAuth.isLoggedIn = () => false;

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Welcome to the App');
    expect(text).toContain('Log in');
    expect(text).toContain('Register');
  });

  it('shows username and dashboard link when logged in', () => {
    mockAuth.isLoggedIn = () => true;
    mockAuth.currentUser = signal({ id: 1, email: 'a@b.com', username: 'alice' });

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('alice');
    expect(text).toContain('Go to Dashboard');
  });
});
