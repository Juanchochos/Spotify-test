import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JWT_EXPIRES_IN } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const user = await this.usersService.create(email, username, password);
    return this.buildTokenResponse(user.id, user.email, user.username);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials.');

    return this.buildTokenResponse(user.id, user.email, user.username);
  }

  private buildTokenResponse(id: number, email: string, username: string) {
    const token = this.jwtService.sign({ sub: id }, { expiresIn: JWT_EXPIRES_IN });
    return { access_token: token, user: { id, email, username } };
  }
}
