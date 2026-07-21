import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from './auth.service';
import { createMockAuthService } from '../testing/mock-auth.service';

describe('RegisterComponent', () => {
  let mockAuth: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuth = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuth }],
    }).compileComponents();
  });

  it('calls auth.register on submit', async () => {
    const registerSpy = vi.fn().mockResolvedValue(undefined);
    mockAuth.register = registerSpy;

    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.componentInstance.email = 'a@b.com';
    fixture.componentInstance.username = 'alice';
    fixture.componentInstance.password = 'password123';
    await fixture.componentInstance.onSubmit();

    expect(registerSpy).toHaveBeenCalledWith('a@b.com', 'alice', 'password123');
  });

  it('shows error message on registration failure', async () => {
    mockAuth.register = vi.fn().mockRejectedValue(new Error('Email already in use.'));

    const fixture = TestBed.createComponent(RegisterComponent);
    await fixture.componentInstance.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Email already in use.');
  });
});
