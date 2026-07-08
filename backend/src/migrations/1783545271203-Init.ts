import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1783545271203 implements MigrationInterface {
    name = 'Init1783545271203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."espacio_status_enum" AS ENUM('AVAILABLE', 'OUT_OF_SERVICE')`);
        await queryRunner.query(`CREATE TABLE "espacio" ("id" SERIAL NOT NULL, "number" integer NOT NULL, "status" "public"."espacio_status_enum" NOT NULL DEFAULT 'AVAILABLE', CONSTRAINT "UQ_eb00ac6c400590a82cc1a35feca" UNIQUE ("number"), CONSTRAINT "PK_5215162f1cedd62e2d253d3cb29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sesion_status_enum" AS ENUM('ACTIVE', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "sesion" ("id" SERIAL NOT NULL, "entryTime" TIMESTAMP NOT NULL, "exitTime" TIMESTAMP, "amountDue" numeric(10,2), "status" "public"."sesion_status_enum" NOT NULL DEFAULT 'ACTIVE', "spotId" integer NOT NULL, "vehicleId" integer NOT NULL, "subscriptionId" integer, CONSTRAINT "PK_387b737518873760846bfd886f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehiculo_type_enum" AS ENUM('CAR', 'MOTORCYCLE', 'PICKUP')`);
        await queryRunner.query(`CREATE TYPE "public"."vehiculo_status_enum" AS ENUM('ACTIVE', 'BLOCKED')`);
        await queryRunner.query(`CREATE TABLE "vehiculo" ("id" SERIAL NOT NULL, "licensePlate" character varying NOT NULL, "ownerName" character varying NOT NULL, "type" "public"."vehiculo_type_enum" NOT NULL, "status" "public"."vehiculo_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "UQ_1731a59535dca903b9801d92c09" UNIQUE ("licensePlate"), CONSTRAINT "PK_79ad0f38366031fd4f2c1efdc62" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."abono_status_enum" AS ENUM('ACTIVE', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "abono" ("id" SERIAL NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "amountDue" numeric(10,2) NOT NULL, "status" "public"."abono_status_enum" NOT NULL DEFAULT 'ACTIVE', "vehicleId" integer NOT NULL, "spotId" integer NOT NULL, CONSTRAINT "PK_1b2c32be053519bd71f6cb5b1ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tarifa_vehicletype_enum" AS ENUM('CAR', 'MOTORCYCLE', 'PICKUP')`);
        await queryRunner.query(`CREATE TABLE "tarifa" ("id" SERIAL NOT NULL, "vehicleType" "public"."tarifa_vehicletype_enum" NOT NULL, "hourlyRate" numeric(10,2) NOT NULL, "monthlyRate" numeric(10,2) NOT NULL, CONSTRAINT "UQ_c17e2eb20857d1bc7d04f50a34f" UNIQUE ("vehicleType"), CONSTRAINT "PK_d213dfbdddef2bfd7b47b6c1e24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sesion" ADD CONSTRAINT "FK_38e0952bd7f74506a6bc61dfcf0" FOREIGN KEY ("spotId") REFERENCES "espacio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sesion" ADD CONSTRAINT "FK_4cfe6a8957509aadac7e80ec53d" FOREIGN KEY ("vehicleId") REFERENCES "vehiculo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sesion" ADD CONSTRAINT "FK_0ddb0c2121e0141f058b9120433" FOREIGN KEY ("subscriptionId") REFERENCES "abono"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abono" ADD CONSTRAINT "FK_588591c86fb337baddb49f7fa35" FOREIGN KEY ("vehicleId") REFERENCES "vehiculo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abono" ADD CONSTRAINT "FK_05b7e3bb3be4f1745bed508e7e2" FOREIGN KEY ("spotId") REFERENCES "espacio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "abono" DROP CONSTRAINT "FK_05b7e3bb3be4f1745bed508e7e2"`);
        await queryRunner.query(`ALTER TABLE "abono" DROP CONSTRAINT "FK_588591c86fb337baddb49f7fa35"`);
        await queryRunner.query(`ALTER TABLE "sesion" DROP CONSTRAINT "FK_0ddb0c2121e0141f058b9120433"`);
        await queryRunner.query(`ALTER TABLE "sesion" DROP CONSTRAINT "FK_4cfe6a8957509aadac7e80ec53d"`);
        await queryRunner.query(`ALTER TABLE "sesion" DROP CONSTRAINT "FK_38e0952bd7f74506a6bc61dfcf0"`);
        await queryRunner.query(`DROP TABLE "tarifa"`);
        await queryRunner.query(`DROP TYPE "public"."tarifa_vehicletype_enum"`);
        await queryRunner.query(`DROP TABLE "abono"`);
        await queryRunner.query(`DROP TYPE "public"."abono_status_enum"`);
        await queryRunner.query(`DROP TABLE "vehiculo"`);
        await queryRunner.query(`DROP TYPE "public"."vehiculo_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."vehiculo_type_enum"`);
        await queryRunner.query(`DROP TABLE "sesion"`);
        await queryRunner.query(`DROP TYPE "public"."sesion_status_enum"`);
        await queryRunner.query(`DROP TABLE "espacio"`);
        await queryRunner.query(`DROP TYPE "public"."espacio_status_enum"`);
    }

}
