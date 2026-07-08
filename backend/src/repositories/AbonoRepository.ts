import { AppDataSource } from "../config/data-source";
import { Abono, EstadoAbono } from "../entities/Abono";

export const AbonoRepository = AppDataSource.getRepository(Abono).extend({
  findActiveByVehicle(vehicleId: number) {
    return this.findOneBy({ vehicleId, status: EstadoAbono.ACTIVE });
  },
  findActiveBySpot(spotId: number) {
    return this.findOneBy({ spotId, status: EstadoAbono.ACTIVE });
  },
});