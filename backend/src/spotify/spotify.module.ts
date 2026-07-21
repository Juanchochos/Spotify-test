import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';

@Module({
  imports: [UsersModule],
  providers: [SpotifyService],
  controllers: [SpotifyController],
})
export class SpotifyModule {}
