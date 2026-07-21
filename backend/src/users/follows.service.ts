import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { User } from './user.entity';
import { Follow } from './follow.entity';
import { UsersService } from './users.service';

export interface PublicUserCard {
  id: number;
  username: string;
  avatarUrl: string | null;
  amIFollowing: boolean;
  isFriend: boolean;
  followerCount?: number;
  followingCount?: number;
}

@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async search(viewerId: number, query: string): Promise<PublicUserCard[]> {
    const q = query?.trim();
    if (!q) return [];

    const users = await this.usersRepository.find({
      where: {
        username: ILike(`%${q}%`),
        id: Not(viewerId),
      },
      take: 20,
      order: { username: 'ASC' },
    });

    return Promise.all(users.map((u) => this.toPublicCard(viewerId, u)));
  }

  async getPublicProfile(viewerId: number, targetId: number): Promise<PublicUserCard> {
    const user = await this.usersService.findById(targetId);
    if (!user) throw new NotFoundException(`User #${targetId} not found`);

    const [followerCount, followingCount, card] = await Promise.all([
      this.followRepository.count({ where: { followingId: targetId } }),
      this.followRepository.count({ where: { followerId: targetId } }),
      this.toPublicCard(viewerId, user),
    ]);

    return { ...card, followerCount, followingCount };
  }

  async follow(viewerId: number, targetId: number): Promise<PublicUserCard> {
    if (viewerId === targetId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    const target = await this.usersService.findById(targetId);
    if (!target) throw new NotFoundException(`User #${targetId} not found`);

    const existing = await this.followRepository.findOneBy({
      followerId: viewerId,
      followingId: targetId,
    });

    if (!existing) {
      await this.followRepository.save(
        this.followRepository.create({ followerId: viewerId, followingId: targetId }),
      );
      this.logger.log(`User ${viewerId} followed ${targetId}`);
    }

    return this.getPublicProfile(viewerId, targetId);
  }

  async unfollow(viewerId: number, targetId: number): Promise<PublicUserCard> {
    await this.followRepository.delete({
      followerId: viewerId,
      followingId: targetId,
    });
    this.logger.log(`User ${viewerId} unfollowed ${targetId}`);

    const target = await this.usersService.findById(targetId);
    if (!target) throw new NotFoundException(`User #${targetId} not found`);
    return this.getPublicProfile(viewerId, targetId);
  }

  async listFollowing(viewerId: number): Promise<PublicUserCard[]> {
    const edges = await this.followRepository.find({
      where: { followerId: viewerId },
      order: { createdAt: 'DESC' },
    });
    return this.cardsForIds(viewerId, edges.map((e) => e.followingId));
  }

  async listFollowers(viewerId: number): Promise<PublicUserCard[]> {
    const edges = await this.followRepository.find({
      where: { followingId: viewerId },
      order: { createdAt: 'DESC' },
    });
    return this.cardsForIds(viewerId, edges.map((e) => e.followerId));
  }

  async listFriends(viewerId: number): Promise<PublicUserCard[]> {
    const following = await this.followRepository.find({
      where: { followerId: viewerId },
    });
    if (following.length === 0) return [];

    const followingIds = following.map((e) => e.followingId);
    const mutual = await this.followRepository
      .createQueryBuilder('f')
      .where('f.followerId IN (:...followingIds)', { followingIds })
      .andWhere('f.followingId = :viewerId', { viewerId })
      .getMany();

    const friendIds = mutual.map((e) => e.followerId);
    return this.cardsForIds(viewerId, friendIds);
  }

  private async cardsForIds(viewerId: number, ids: number[]): Promise<PublicUserCard[]> {
    if (ids.length === 0) return [];
    const users = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids })
      .getMany();
    const byId = new Map(users.map((u) => [u.id, u]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as User[];
    return Promise.all(ordered.map((u) => this.toPublicCard(viewerId, u)));
  }

  private async toPublicCard(viewerId: number, user: User): Promise<PublicUserCard> {
    if (viewerId === user.id) {
      return {
        id: user.id,
        username: user.username,
        avatarUrl: this.avatarFromProfile(user),
        amIFollowing: false,
        isFriend: false,
      };
    }

    const [amIFollowing, theyFollowMe] = await Promise.all([
      this.followRepository.exist({
        where: { followerId: viewerId, followingId: user.id },
      }),
      this.followRepository.exist({
        where: { followerId: user.id, followingId: viewerId },
      }),
    ]);

    return {
      id: user.id,
      username: user.username,
      avatarUrl: this.avatarFromProfile(user),
      amIFollowing,
      isFriend: amIFollowing && theyFollowMe,
    };
  }

  private avatarFromProfile(user: User): string | null {
    const images = user.spotifyProfile?.images;
    if (Array.isArray(images) && images[0]?.url) return images[0].url as string;
    return null;
  }
}
