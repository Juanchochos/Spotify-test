import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { Follow } from './follow.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('FollowsService', () => {
  let service: FollowsService;
  let followRepo: Record<string, jest.Mock>;
  let usersRepo: Record<string, jest.Mock>;
  let usersService: { findById: jest.Mock };

  beforeEach(async () => {
    followRepo = {
      findOneBy: jest.fn(),
      save: jest.fn(async (row) => row),
      create: jest.fn((data) => data),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      exist: jest.fn().mockResolvedValue(false),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };
    usersRepo = {
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };
    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        { provide: getRepositoryToken(Follow), useValue: followRepo },
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get(FollowsService);
  });

  it('follow rejects self-follow', async () => {
    await expect(service.follow(1, 1)).rejects.toThrow(BadRequestException);
  });

  it('follow throws when target missing', async () => {
    usersService.findById.mockResolvedValue(null);
    await expect(service.follow(1, 99)).rejects.toThrow(NotFoundException);
  });

  it('follow creates edge when not already following', async () => {
    usersService.findById.mockResolvedValue({
      id: 2,
      username: 'bob',
      spotifyProfile: null,
    });
    followRepo.findOneBy.mockResolvedValue(null);
    followRepo.exist
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    followRepo.count.mockResolvedValue(1);

    const card = await service.follow(1, 2);

    expect(followRepo.save).toHaveBeenCalled();
    expect(card.amIFollowing).toBe(true);
    expect(card.isFriend).toBe(false);
  });

  it('marks friends when mutual', async () => {
    usersService.findById.mockResolvedValue({
      id: 2,
      username: 'bob',
      spotifyProfile: { images: [{ url: 'http://img' }] },
    });
    followRepo.exist.mockResolvedValue(true);
    followRepo.count.mockResolvedValue(3);

    const card = await service.getPublicProfile(1, 2);

    expect(card.isFriend).toBe(true);
    expect(card.avatarUrl).toBe('http://img');
    expect(card.followerCount).toBe(3);
  });
});
