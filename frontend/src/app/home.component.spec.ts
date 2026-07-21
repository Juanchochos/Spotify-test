import { TestBed } from '@angular/core/testing';
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

  it('shows login and register when logged out', () => {
    mockAuth.isLoggedIn = () => false;

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Wishare');
    expect(text).toContain('Log in');
    expect(text).toContain('Get started');
  });

  it('shows open night CTA when logged in', () => {
    mockAuth.isLoggedIn = () => true;

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Open your night');
    expect(text).toContain('Create a post');
  });
});
