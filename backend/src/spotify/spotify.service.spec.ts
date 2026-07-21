import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { UsersService } from '../users/users.service';

describe('SpotifyService', () => {
  let service: SpotifyService;
  let usersService: {
    findById: jest.Mock;
    saveSpotifyTokens: jest.Mock;
    updateSpotifyAccessToken: jest.Mock;
    clearSpotifyProfile: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      saveSpotifyTokens: jest.fn(),
      updateSpotifyAccessToken: jest.fn(),
      clearSpotifyProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotifyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SPOTIFY_CLIENT_ID') return 'client-id';
              if (key === 'SPOTIFY_REDIRECT_URI') return 'http://127.0.0.1:5173/spotify-user';
              return undefined;
            }),
          },
        },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<SpotifyService>(SpotifyService);
  });

  it('getStatus returns connected when user has refresh token', async () => {
    usersService.findById.mockResolvedValue({
      id: 1,
      spotifyRefreshToken: 'refresh',
      spotifyProfile: { display_name: 'Alice' },
    });

    const status = await service.getStatus(1);

    expect(status.connected).toBe(true);
    expect(status.profile).toEqual({ display_name: 'Alice' });
  });

  it('searchTracks throws when spotify not connected', async () => {
    usersService.findById.mockResolvedValue({ id: 1, spotifyAccessToken: null, spotifyRefreshToken: null });

    await expect(service.searchTracks(1, 'hello')).rejects.toThrow(UnauthorizedException);
  });

  it('disconnect clears spotify data', async () => {
    const result = await service.disconnect(1);
    expect(usersService.clearSpotifyProfile).toHaveBeenCalledWith(1);
    expect(result).toEqual({ ok: true });
  });
});
