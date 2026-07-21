import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly refreshSkewMs = 60_000;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private get clientId(): string {
    const id = this.config.get<string>('SPOTIFY_CLIENT_ID')?.trim();
    if (!id) {
      throw new ServiceUnavailableException(
        'SPOTIFY_CLIENT_ID is not configured on the server.',
      );
    }
    return id;
  }

  private get redirectUri(): string {
    const uri = this.config.get<string>('SPOTIFY_REDIRECT_URI')?.trim();
    if (!uri) {
      throw new ServiceUnavailableException(
        'SPOTIFY_REDIRECT_URI is not configured on the server.',
      );
    }
    return uri;
  }

  async completeOAuth(userId: number, code: string, codeVerifier: string) {
    const tokens = await this.exchangeAuthorizationCode(code, codeVerifier);
    const profile = await this.fetchSpotifyProfile(tokens.access_token);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await this.usersService.saveSpotifyTokens(userId, {
      spotifyAccessToken: tokens.access_token,
      spotifyRefreshToken: tokens.refresh_token ?? null,
      spotifyTokenExpiresAt: expiresAt,
      spotifyId: profile.id,
      spotifyProfile: profile,
    });

    this.logger.log(`Spotify connected for userId=${userId} spotifyId=${profile.id}`);
    return { connected: true, profile };
  }

  async getStatus(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const connected = this.hasSpotifyConnection(user);
    return {
      connected,
      profile: connected ? user.spotifyProfile ?? null : null,
    };
  }

  async searchTracks(userId: number, query: string) {
    const q = query?.trim();
    if (!q) throw new BadRequestException('Query is required.');

    const accessToken = await this.getValidAccessToken(userId);
    const params = new URLSearchParams({ q, type: 'track', limit: '10' });
    const res = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 401) {
      throw new UnauthorizedException('Spotify session expired. Please reconnect Spotify.');
    }

    if (!res.ok) {
      const errText = await res.text();
      this.logger.warn(`Spotify search failed: ${errText}`);
      throw new BadRequestException('Spotify search failed.');
    }

    const data = await res.json();
    return data.tracks?.items ?? [];
  }

  async disconnect(userId: number) {
    await this.usersService.clearSpotifyProfile(userId);
    this.logger.log(`Spotify disconnected for userId=${userId}`);
    return { ok: true };
  }

  private hasSpotifyConnection(user: User): boolean {
    return !!(user.spotifyRefreshToken || user.spotifyAccessToken);
  }

  private async getValidAccessToken(userId: number): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user || !this.hasSpotifyConnection(user)) {
      throw new UnauthorizedException('Spotify is not connected. Please reconnect Spotify.');
    }

    const expiresAt = user.spotifyTokenExpiresAt
      ? new Date(user.spotifyTokenExpiresAt).getTime()
      : 0;
    const stillValid =
      !!user.spotifyAccessToken && expiresAt - this.refreshSkewMs > Date.now();

    if (stillValid) {
      return user.spotifyAccessToken!;
    }

    if (!user.spotifyRefreshToken) {
      throw new UnauthorizedException('Spotify session expired. Please reconnect Spotify.');
    }

    this.logger.log(`Refreshing Spotify access token for userId=${userId}`);
    const refreshed = await this.refreshAccessToken(user.spotifyRefreshToken);
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
    await this.usersService.updateSpotifyAccessToken(
      userId,
      refreshed.access_token,
      newExpiresAt,
      refreshed.refresh_token,
    );
    return refreshed.access_token;
  }

  private async exchangeAuthorizationCode(
    code: string,
    codeVerifier: string,
  ): Promise<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.warn(`Spotify token exchange failed: ${errText}`);
      throw new BadRequestException('Spotify token exchange failed. Please try connecting again.');
    }

    return res.json() as Promise<SpotifyTokenResponse>;
  }

  private async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.warn(`Spotify token refresh failed: ${errText}`);
      throw new UnauthorizedException('Spotify session expired. Please reconnect Spotify.');
    }

    return res.json() as Promise<SpotifyTokenResponse>;
  }

  private async fetchSpotifyProfile(accessToken: string): Promise<any> {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      this.logger.warn(`Spotify profile fetch failed: ${errText}`);
      throw new BadRequestException('Unable to load Spotify profile.');
    }

    return res.json();
  }
}
