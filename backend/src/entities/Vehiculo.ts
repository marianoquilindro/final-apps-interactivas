import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Sesion } from "./Sesion";
import { Abono } from "./Abono";

export enum TipoVehiculo {
  CAR = "CAR",
  MOTORCYCLE = "MOTORCYCLE",
  PICKUP = "PICKUP",
}

export enum EstadoVehiculo {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

@Entity()
export class Vehiculo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  licensePlate!: string;

  @Column()
  ownerName!: string;

  @Column({
    type: "enum",
    enum: TipoVehiculo,
  })
  type!: TipoVehiculo;

  @Column({
    type: "enum",
    enum: EstadoVehiculo,
    default: EstadoVehiculo.ACTIVE,
  })
  status!: EstadoVehiculo;

  @OneToMany(() => Sesion, (sesion) => sesion.vehicle)
  sessions!: Sesion[];

  @OneToMany(() => Abono, (abono) => abono.vehicle)
  subscriptions!: Abono[];
}