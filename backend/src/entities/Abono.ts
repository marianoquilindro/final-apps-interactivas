import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Vehiculo } from "./Vehiculo";
import { Espacio } from "./Espacio";
import { Sesion } from "./Sesion";

export enum EstadoAbono {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

@Entity()
export class Abono {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "timestamp" })
  startDate!: Date;

  @Column({ type: "timestamp" })
  endDate!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  amountDue!: number;

  @Column({
    type: "enum",
    enum: EstadoAbono,
    default: EstadoAbono.ACTIVE,
  })
  status!: EstadoAbono;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.subscriptions)
  @JoinColumn({ name: "vehicleId" })
  vehicle!: Vehiculo;

  @Column()
  vehicleId!: number;

  @ManyToOne(() => Espacio, (espacio) => espacio.subscriptions)
  @JoinColumn({ name: "spotId" })
  spot!: Espacio;

  @Column()
  spotId!: number;

  @OneToMany(() => Sesion, (sesion) => sesion.subscription)
  sessions!: Sesion[];
}