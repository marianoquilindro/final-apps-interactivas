import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Vehiculo } from "./Vehiculo";
import { Espacio } from "./Espacio";
import { Abono } from "./Abono";

export enum EstadoSesion {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

@Entity()
export class Sesion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "timestamp" })
  entryTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  exitTime!: Date | null;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  amountDue!: number | null;

  @Column({
    type: "enum",
    enum: EstadoSesion,
    default: EstadoSesion.ACTIVE,
  })
  status!: EstadoSesion;

  @ManyToOne(() => Espacio, (espacio) => espacio.sessions)
  @JoinColumn({ name: "spotId" })
  spot!: Espacio;

  @Column()
  spotId!: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.sessions)
  @JoinColumn({ name: "vehicleId" })
  vehicle!: Vehiculo;

  @Column()
  vehicleId!: number;

  @ManyToOne(() => Abono, (abono) => abono.sessions, { nullable: true })
  @JoinColumn({ name: "subscriptionId" })
  subscription!: Abono | null;

  @Column({ nullable: true })
  subscriptionId!: number | null;
}