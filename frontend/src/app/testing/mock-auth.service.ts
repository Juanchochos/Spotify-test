import { signal } from '@angular/core';
import { AuthUser } from '../auth/auth.service';

export function createMockAuthService(overrides: Partial<MockAuthService> = {}): MockAuthService {
  return {
    currentUser: signal<AuthUser | null>(null),
    getToken: () => null,
    isLoggedIn: () => false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    ...overrides,
  };
}

export type MockAuthService = {
  currentUser: ReturnType<typeof signal<AuthUser | null>>;
  getToken: () => string | null;
  isLoggedIn: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};
