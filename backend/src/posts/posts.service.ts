import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { SongEntry } from './song-entry.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(SongEntry)
    private readonly songsRepository: Repository<SongEntry>,
  ) {}

  async create(userId: number, dto: CreatePostDto): Promise<Post> {
    try {
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

      this.logger.log(
        `Created post id=${saved.id} userId=${userId} songs=${dto.songs.length}`,
      );
      return this.postsRepository.findOneBy({ id: saved.id }) as Promise<Post>;
    } catch (err) {
      this.logger.error(
        `Failed to create post for userId=${userId}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }

  findByUser(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      this.logger.warn(`Delete post #${id}: not found (userId=${userId})`);
      throw new NotFoundException(`Post #${id} not found`);
    }
    if (post.userId !== userId) {
      this.logger.warn(
        `Delete post #${id}: forbidden (owner=${post.userId} requester=${userId})`,
      );
      throw new ForbiddenException('You can only delete your own posts.');
    }
    await this.postsRepository.delete(id);
    this.logger.log(`Deleted post id=${id} userId=${userId}`);
  }
}
