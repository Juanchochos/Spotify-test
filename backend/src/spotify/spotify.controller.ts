import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpotifyService } from './spotify.service';
import { SpotifyCallbackDto } from './dto/spotify-callback.dto';

@Controller('spotify')
@UseGuards(JwtAuthGuard)
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Post('callback')
  callback(@Request() req, @Body() body: SpotifyCallbackDto) {
    return this.spotifyService.completeOAuth(req.user.id, body.code, body.codeVerifier);
  }

  @Get('status')
  status(@Request() req) {
    return this.spotifyService.getStatus(req.user.id);
  }

  @Get('search')
  search(@Request() req, @Query('q') q: string) {
    return this.spotifyService.searchTracks(req.user.id, q);
  }

  @Delete('disconnect')
  disconnect(@Request() req) {
    return this.spotifyService.disconnect(req.user.id);
  }
}
