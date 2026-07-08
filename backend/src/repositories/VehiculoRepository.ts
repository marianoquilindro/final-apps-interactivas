import { AppDataSource } from "../config/data-source";
import { Vehiculo } from "../entities/Vehiculo";

export const VehiculoRepository = AppDataSource.getRepository(Vehiculo).extend({
  findByLicensePlate(licensePlate: string) {
    return this.findOneBy({ licensePlate });
  },
});