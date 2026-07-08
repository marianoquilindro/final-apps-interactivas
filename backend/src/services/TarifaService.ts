import { TarifaRepository } from "../repositories/TarifaRepository";

export class TarifaService {
  static async listar() {
    return TarifaRepository.find();
  }

  static async actualizar(id: number, data: { hourlyRate?: number; monthlyRate?: number }) {
    const tarifa = await TarifaRepository.findOneBy({ id });
    if (!tarifa) {
      throw { status: 404, message: "Tarifa no encontrada" };
    }

    if (data.hourlyRate !== undefined) {
      if (data.hourlyRate <= 0) {
        throw { status: 422, message: "hourlyRate debe ser mayor a 0" };
      }
      tarifa.hourlyRate = data.hourlyRate;
    }

    if (data.monthlyRate !== undefined) {
      if (data.monthlyRate <= 0) {
        throw { status: 422, message: "monthlyRate debe ser mayor a 0" };
      }
      tarifa.monthlyRate = data.monthlyRate;
    }

    return TarifaRepository.save(tarifa);
  }
}