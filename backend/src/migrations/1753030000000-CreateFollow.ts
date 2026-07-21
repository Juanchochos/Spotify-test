import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollow1753030000000 implements MigrationInterface {
  name = 'CreateFollow1753030000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "follow" (
        "id" SERIAL NOT NULL,
        "followerId" integer NOT NULL,
        "followingId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_follow" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_follow_follower_following" UNIQUE ("followerId", "followingId"),
        CONSTRAINT "FK_follow_follower" FOREIGN KEY ("followerId")
          REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_follow_following" FOREIGN KEY ("followingId")
          REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_follow_followerId" ON "follow" ("followerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_follow_followingId" ON "follow" ("followingId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_follow_followingId"`);
    await queryRunner.query(`DROP INDEX "IDX_follow_followerId"`);
    await queryRunner.query(`DROP TABLE "follow"`);
  }
}
