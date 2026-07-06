import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/post.entity';
import { SongEntry } from './posts/song-entry.entity';

const frontendDistPath = join(process.cwd(), 'frontend-dist');

const productionImports =
  process.env.NODE_ENV === 'production'
    ? [
        ServeStaticModule.forRoot({
          rootPath: frontendDistPath,
          exclude: ['/api*'],
          serveStaticOptions: {
            fallthrough: true,
          },
        }),
      ]
    : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...productionImports,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_PATH', 'db.sqlite'),
        entities: [User, Post, SongEntry],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
