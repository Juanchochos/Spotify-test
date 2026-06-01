import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ArrayMaxSize,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';

export class SongEntryDto {
  @IsString()
  spotifyTrackId: string;

  @IsString()
  trackName: string;

  @IsString()
  artistName: string;

  @IsString()
  albumName: string;

  @IsOptional()
  @IsString()
  albumImageUrl?: string;

  @IsInt()
  @Min(0)
  @Max(4)
  position: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SongEntryDto)
  songs: SongEntryDto[];
}
