import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('register returns token and user', async () => {
    usersService.create!.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      username: 'alice',
    } as any);

    const result = await service.register('a@b.com', 'alice', 'password123');

    expect(result.access_token).toBe('signed-jwt-token');
    expect(result.user).toEqual({ id: 1, email: 'a@b.com', username: 'alice' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 }, { expiresIn: '7d' });
  });

  it('login throws when user not found', async () => {
    usersService.findByEmail!.mockResolvedValue(null);

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('login throws when password is invalid', async () => {
    usersService.findByEmail!.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      username: 'alice',
      passwordHash: await bcrypt.hash('correct', 10),
    } as any);

    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
  });

  it('login returns token when credentials are valid', async () => {
    const hash = await bcrypt.hash('correct', 10);
    usersService.findByEmail!.mockResolvedValue({
      id: 2,
      email: 'b@c.com',
      username: 'bob',
      passwordHash: hash,
    } as any);

    const result = await service.login('b@c.com', 'correct');

    expect(result.access_token).toBe('signed-jwt-token');
    expect(result.user.username).toBe('bob');
  });
});
