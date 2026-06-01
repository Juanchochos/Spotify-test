import { Controller, Post, Get, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('spotify-profile')
  async getSpotifyProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return { profile: user?.spotifyProfile ?? null };
  }

  @UseGuards(JwtAuthGuard)
  @Post('spotify-profile')
  async saveSpotifyProfile(@Request() req, @Body() body: { profile: any }) {
    await this.usersService.saveSpotifyProfile(req.user.id, body.profile);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('spotify-profile')
  async deleteSpotifyProfile(@Request() req) {
    await this.usersService.clearSpotifyProfile(req.user.id);
    return { ok: true };
  }
}
