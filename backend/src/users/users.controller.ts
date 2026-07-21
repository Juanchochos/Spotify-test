import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowsService } from './follows.service';
import { PostsService } from '../posts/posts.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly followsService: FollowsService,
    private readonly postsService: PostsService,
  ) {}

  @Get('search')
  search(@Request() req, @Query('q') q: string) {
    return this.followsService.search(req.user.id, q ?? '');
  }

  @Get('me/following')
  myFollowing(@Request() req) {
    return this.followsService.listFollowing(req.user.id);
  }

  @Get('me/followers')
  myFollowers(@Request() req) {
    return this.followsService.listFollowers(req.user.id);
  }

  @Get('me/friends')
  myFriends(@Request() req) {
    return this.followsService.listFriends(req.user.id);
  }

  @Get(':id')
  profile(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.followsService.getPublicProfile(req.user.id, id);
  }

  @Get(':id/posts')
  posts(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findByUser(id);
  }

  @Post(':id/follow')
  follow(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.followsService.follow(req.user.id, id);
  }

  @Delete(':id/follow')
  unfollow(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.followsService.unfollow(req.user.id, id);
  }
}
