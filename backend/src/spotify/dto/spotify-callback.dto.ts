import { IsString, MinLength } from 'class-validator';

export class SpotifyCallbackDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  codeVerifier: string;
}
