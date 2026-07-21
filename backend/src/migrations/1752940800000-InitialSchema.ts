import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1752940800000 implements MigrationInterface {
  name = 'InitialSchema1752940800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "spotifyProfile" text,
        "spotifyId" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "UQ_user_username" UNIQUE ("username"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_post" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "song_entry" (
        "id" SERIAL NOT NULL,
        "postId" integer NOT NULL,
        "spotifyTrackId" character varying NOT NULL,
        "trackName" character varying NOT NULL,
        "artistName" character varying NOT NULL,
        "albumName" character varying NOT NULL,
        "albumImageUrl" character varying,
        "position" integer NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_song_entry" PRIMARY KEY ("id"),
        CONSTRAINT "FK_song_entry_post" FOREIGN KEY ("postId")
          REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "song_entry"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
