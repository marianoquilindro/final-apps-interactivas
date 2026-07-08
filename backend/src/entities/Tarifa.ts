import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { TipoVehiculo } from "./Vehiculo";

@Entity()
export class Tarifa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: TipoVehiculo,
    unique: true,
  })
  vehicleType!: TipoVehiculo;

  @Column("decimal", { precision: 10, scale: 2 })
  hourlyRate!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  monthlyRate!: number;
}