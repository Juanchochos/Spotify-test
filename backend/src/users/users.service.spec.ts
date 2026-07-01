import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    findOneBy: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findOneBy: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (user) => ({ id: 1, ...user })),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('create throws when email already in use', async () => {
    repo.findOneBy.mockResolvedValueOnce({ id: 99 });

    await expect(service.create('a@b.com', 'alice', 'password123')).rejects.toThrow(
      ConflictException,
    );
  });

  it('create throws when username already taken', async () => {
    repo.findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 99 });

    await expect(service.create('a@b.com', 'alice', 'password123')).rejects.toThrow(
      ConflictException,
    );
  });

  it('create saves a new user', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const user = await service.create('a@b.com', 'alice', 'password123');

    expect(user.email).toBe('a@b.com');
    expect(user.username).toBe('alice');
    expect(repo.save).toHaveBeenCalled();
  });

  it('saveSpotifyProfile updates user record', async () => {
    const profile = { id: 'sp1', display_name: 'Alice' };
    await service.saveSpotifyProfile(1, profile);

    expect(repo.update).toHaveBeenCalledWith(1, {
      spotifyId: 'sp1',
      spotifyProfile: profile,
    });
  });

  it('clearSpotifyProfile nulls spotify fields', async () => {
    await service.clearSpotifyProfile(1);

    expect(repo.update).toHaveBeenCalledWith(1, {
      spotifyId: null,
      spotifyProfile: null,
    });
  });
});
