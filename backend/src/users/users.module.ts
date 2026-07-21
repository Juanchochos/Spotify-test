import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Follow } from './follow.entity';
import { UsersService } from './users.service';
import { FollowsService } from './follows.service';
import { UsersController } from './users.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow]), PostsModule],
  providers: [UsersService, FollowsService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
