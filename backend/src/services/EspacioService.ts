import { EspacioRepository } from "../repositories/EspacioRepository";
import { EstadoEspacio } from "../entities/Espacio";

export class EspacioService {
  static async listar() {
    return EspacioRepository.find();
  }

  static async crear(data: { number: number; status?: EstadoEspacio }) {
  if (data.number === undefined || data.number === null || typeof data.number !== "number" || isNaN(data.number)) {
    throw { status: 422, message: "El campo 'number' es obligatorio y debe ser numérico" };
  }

  if (data.status && !Object.values(EstadoEspacio).includes(data.status)) {
    throw { status: 422, message: "status inválido" };
  }

  const existente = await EspacioRepository.findByNumber(data.number);
  if (existente) {
    throw { status: 409, message: `Ya existe un espacio con number ${data.number}` };
  }

  const espacio = EspacioRepository.create({
    number: data.number,
    status: data.status ?? EstadoEspacio.AVAILABLE,
  });

  return EspacioRepository.save(espacio);
}
}