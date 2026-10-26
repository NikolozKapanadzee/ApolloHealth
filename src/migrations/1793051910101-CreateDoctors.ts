import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctors1793051910101 implements MigrationInterface {
    name = 'CreateDoctors1793051910101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "doctors" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "specialty" character varying NOT NULL, "licenseNumber" character varying NOT NULL, "bio" text, "yearsOfExperience" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_764e04456946abd3fbd4155421e" UNIQUE ("licenseNumber"), CONSTRAINT "REL_55651e05e46413d510215535ed" UNIQUE ("userId"), CONSTRAINT "PK_8207e7889b50ee3695c2b8154ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_55651e05e46413d510215535edf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_55651e05e46413d510215535edf"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
    }

}
