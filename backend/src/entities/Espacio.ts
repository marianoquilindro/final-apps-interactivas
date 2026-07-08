import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Sesion } from "./Sesion";
import { Abono } from "./Abono";

export enum EstadoEspacio {
  AVAILABLE = "AVAILABLE",
  OUT_OF_SERVICE = "OUT_OF_SERVICE",
}

@Entity()
export class Espacio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  number!: number;

  @Column({
    type: "enum",
    enum: EstadoEspacio,
    default: EstadoEspacio.AVAILABLE,
  })
  status!: EstadoEspacio;

  @OneToMany(() => Sesion, (sesion) => sesion.spot)
  sessions!: Sesion[];

  @OneToMany(() => Abono, (abono) => abono.spot)
  subscriptions!: Abono[];
}