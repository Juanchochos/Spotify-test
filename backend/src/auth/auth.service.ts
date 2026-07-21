import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JWT_EXPIRES_IN } from './auth.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    try {
      const user = await this.usersService.create(email, username, password);
      this.logger.log(`Registered user id=${user.id} username=${username}`);
      return this.buildTokenResponse(user.id, user.email, user.username);
    } catch (err) {
      this.logger.warn(`Registration failed for email=${email}: ${this.errMessage(err)}`);
      throw err;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login failed: unknown email=${email}`);
      throw new UnauthorizedException('Invalid credentials.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      this.logger.warn(`Login failed: bad password for user id=${user.id}`);
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.logger.log(`Login success user id=${user.id}`);
    return this.buildTokenResponse(user.id, user.email, user.username);
  }

  private buildTokenResponse(id: number, email: string, username: string) {
    const token = this.jwtService.sign({ sub: id }, { expiresIn: JWT_EXPIRES_IN });
    return { access_token: token, user: { id, email, username } };
  }

  private errMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
