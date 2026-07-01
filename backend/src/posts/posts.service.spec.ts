import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './post.entity';
import { SongEntry } from './song-entry.entity';

describe('PostsService', () => {
  let service: PostsService;
  let postsRepo: Record<string, jest.Mock>;
  let songsRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    postsRepo = {
      create: jest.fn((data) => data),
      save: jest.fn(async (post) => ({ id: 1, ...post })),
      findOneBy: jest.fn(async ({ id }) => ({ id, userId: 1, description: 'hi', songs: [] })),
      find: jest.fn(),
      delete: jest.fn(),
    };
    songsRepo = {
      create: jest.fn((data) => data),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: postsRepo },
        { provide: getRepositoryToken(SongEntry), useValue: songsRepo },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('create saves post and songs', async () => {
    const dto = {
      description: 'My mix',
      songs: [
        {
          spotifyTrackId: 't1',
          trackName: 'Song',
          artistName: 'Artist',
          albumName: 'Album',
          position: 0,
        },
      ],
    };

    await service.create(1, dto);

    expect(postsRepo.save).toHaveBeenCalled();
    expect(songsRepo.save).toHaveBeenCalled();
  });

  it('findByUser queries by userId', async () => {
    postsRepo.find.mockResolvedValue([]);

    await service.findByUser(5);

    expect(postsRepo.find).toHaveBeenCalledWith({
      where: { userId: 5 },
      order: { createdAt: 'DESC' },
    });
  });

  it('remove throws NotFoundException when post missing', async () => {
    postsRepo.findOneBy.mockResolvedValue(null);

    await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
  });

  it('remove throws ForbiddenException for wrong owner', async () => {
    postsRepo.findOneBy.mockResolvedValue({ id: 1, userId: 2 });

    await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
  });

  it('remove deletes post when owner matches', async () => {
    postsRepo.findOneBy.mockResolvedValue({ id: 1, userId: 1 });

    await service.remove(1, 1);

    expect(postsRepo.delete).toHaveBeenCalledWith(1);
  });
});
