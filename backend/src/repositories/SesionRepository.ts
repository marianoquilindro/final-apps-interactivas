import { AppDataSource } from "../config/data-source";
import { Sesion, EstadoSesion } from "../entities/Sesion";

export const SesionRepository = AppDataSource.getRepository(Sesion).extend({
  findActiveBySpot(spotId: number) {
    return this.findOneBy({ spotId, status: EstadoSesion.ACTIVE });
  },
  findActiveByVehicle(vehicleId: number) {
    return this.findOneBy({ vehicleId, status: EstadoSesion.ACTIVE });
  },
  findActiveBySubscription(subscriptionId: number) {
    return this.findOneBy({ subscriptionId, status: EstadoSesion.ACTIVE });
  },
});