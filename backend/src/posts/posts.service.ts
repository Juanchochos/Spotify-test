import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { SongEntry } from './song-entry.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(SongEntry)
    private readonly songsRepository: Repository<SongEntry>,
  ) {}

  async create(userId: number, dto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      userId,
      description: dto.description ?? null,
    });
    const saved = await this.postsRepository.save(post);

    if (dto.songs.length > 0) {
      const songEntities = dto.songs.map((s) =>
        this.songsRepository.create({ ...s, postId: saved.id }),
      );
      await this.songsRepository.save(songEntities);
    }

    return this.postsRepository.findOneBy({ id: saved.id }) as Promise<Post>;
  }

  findByUser(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    if (post.userId !== userId) throw new ForbiddenException();
    await this.postsRepository.delete(id);
  }
}
