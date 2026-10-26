import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageUrlToDoctors1793056958783 implements MigrationInterface {
    name = 'AddImageUrlToDoctors1793056958783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" ADD "imageUrl" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "imageUrl"`);
    }

}
