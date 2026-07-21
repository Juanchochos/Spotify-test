import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;
  let usersService: jest.Mocked<Partial<UsersService>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
      saveSpotifyProfile: jest.fn(),
      clearSpotifyProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('register delegates to authService', () => {
    const dto = { email: 'a@b.com', username: 'alice', password: 'pass12345' };
    authService.register!.mockReturnValue({ access_token: 'tok' } as any);

    controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith('a@b.com', 'alice', 'pass12345');
  });

  it('login delegates to authService', () => {
    const dto = { email: 'a@b.com', password: 'pass12345' };
    authService.login!.mockReturnValue({ access_token: 'tok' } as any);

    controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith('a@b.com', 'pass12345');
  });

  it('me returns authenticated user from request', () => {
    const req = { user: { id: 1, email: 'a@b.com', username: 'alice' } };
    expect(controller.me(req)).toEqual(req.user);
  });

  it('getSpotifyProfile returns stored profile', async () => {
    usersService.findById!.mockResolvedValue({ spotifyProfile: { id: 'sp1' } } as any);

    const result = await controller.getSpotifyProfile({ user: { id: 1 } });

    expect(result).toEqual({ profile: { id: 'sp1' } });
  });

  it('saveSpotifyProfile persists profile', async () => {
    const profile = { id: 'sp1', display_name: 'Alice' };

    const result = await controller.saveSpotifyProfile(
      { user: { id: 1 } },
      { profile },
    );

    expect(usersService.saveSpotifyProfile).toHaveBeenCalledWith(1, profile);
    expect(result).toEqual({ ok: true });
  });

  it('deleteSpotifyProfile clears profile', async () => {
    const result = await controller.deleteSpotifyProfile({ user: { id: 1 } });

    expect(usersService.clearSpotifyProfile).toHaveBeenCalledWith(1);
    expect(result).toEqual({ ok: true });
  });
});
