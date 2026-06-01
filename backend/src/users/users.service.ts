import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

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
}
