import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

export interface SpotifyTokenUpdate {
  spotifyAccessToken: string;
  spotifyRefreshToken: string | null;
  spotifyTokenExpiresAt: Date;
  spotifyId: string;
  spotifyProfile: any;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(email: string, username: string, password: string): Promise<User> {
    const existingEmail = await this.usersRepository.findOneBy({ email });
    if (existingEmail) throw new ConflictException('Email already in use.');

    const existingUsername = await this.usersRepository.findOneBy({ username });
    if (existingUsername) throw new ConflictException('Username already taken.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, username, passwordHash });
    return this.usersRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async saveSpotifyProfile(userId: number, profile: any): Promise<void> {
    await this.usersRepository.update(userId, {
      spotifyId: profile.id,
      spotifyProfile: profile,
    });
  }

  async saveSpotifyTokens(userId: number, data: SpotifyTokenUpdate): Promise<void> {
    await this.usersRepository.update(userId, {
      spotifyAccessToken: data.spotifyAccessToken,
      spotifyRefreshToken: data.spotifyRefreshToken,
      spotifyTokenExpiresAt: data.spotifyTokenExpiresAt,
      spotifyId: data.spotifyId,
      spotifyProfile: data.spotifyProfile,
    });
  }

  async updateSpotifyAccessToken(
    userId: number,
    accessToken: string,
    expiresAt: Date,
    refreshToken?: string | null,
  ): Promise<void> {
    const patch: Partial<User> = {
      spotifyAccessToken: accessToken,
      spotifyTokenExpiresAt: expiresAt,
    };
    if (refreshToken !== undefined && refreshToken !== null) {
      patch.spotifyRefreshToken = refreshToken;
    }
    await this.usersRepository.update(userId, patch);
  }

  async clearSpotifyProfile(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      spotifyId: null,
      spotifyProfile: null,
      spotifyAccessToken: null,
      spotifyRefreshToken: null,
      spotifyTokenExpiresAt: null,
    });
  }
}
