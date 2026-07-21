import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpotifyTokens1752942000000 implements MigrationInterface {
  name = 'AddSpotifyTokens1752942000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD COLUMN "spotifyAccessToken" text,
        ADD COLUMN "spotifyRefreshToken" text,
        ADD COLUMN "spotifyTokenExpiresAt" TIMESTAMPTZ
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
        DROP COLUMN "spotifyAccessToken",
        DROP COLUMN "spotifyRefreshToken",
        DROP COLUMN "spotifyTokenExpiresAt"
    `);
  }
}
