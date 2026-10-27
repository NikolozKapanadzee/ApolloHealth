import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToUsers1792964738465 implements MigrationInterface {
  name = 'AddCreatedByToUsers1792964738465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "createdById" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdById"`);
  }
}
