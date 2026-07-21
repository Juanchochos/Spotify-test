import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/post.entity';
import { SongEntry } from './posts/song-entry.entity';
import { SpotifyModule } from './spotify/spotify.module';
import { InitialSchema1752940800000 } from './migrations/1752940800000-InitialSchema';
import { AddSpotifyTokens1752942000000 } from './migrations/1752942000000-AddSpotifyTokens';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error(
            'DATABASE_URL is required. Copy backend/.env.example to backend/.env and start Postgres (see README).',
          );
        }

        return {
          type: 'postgres' as const,
          url: databaseUrl,
          entities: [User, Post, SongEntry],
          migrations: [InitialSchema1752940800000, AddSpotifyTokens1752942000000],
          synchronize: false,
          migrationsRun: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    SpotifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
