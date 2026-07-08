import { AppDataSource } from "../config/data-source";
import { Tarifa } from "../entities/Tarifa";

export const TarifaRepository = AppDataSource.getRepository(Tarifa).extend({
  findByVehicleType(vehicleType: string) {
    return this.findOneBy({ vehicleType: vehicleType as any });
  },
});