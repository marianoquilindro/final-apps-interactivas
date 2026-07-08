import { AppDataSource } from "../config/data-source";
import { Espacio } from "../entities/Espacio";

export const EspacioRepository = AppDataSource.getRepository(Espacio).extend({
  findByNumber(number: number) {
    return this.findOneBy({ number });
  },
});