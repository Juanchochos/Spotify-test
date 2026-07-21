import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/user.entity';
import { Post } from './posts/post.entity';
import { SongEntry } from './posts/song-entry.entity';

config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for TypeORM CLI commands.');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [User, Post, SongEntry],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
