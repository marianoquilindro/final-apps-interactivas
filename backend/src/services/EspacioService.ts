import { EspacioRepository } from "../repositories/EspacioRepository";
import { EstadoEspacio } from "../entities/Espacio";

export class EspacioService {
  static async listar() {
    return EspacioRepository.find();
  }

  static async crear(data: { number: number; status?: EstadoEspacio }) {
    if (data.number === undefined || data.number === null) {
      throw { status: 422, message: "El campo 'number' es obligatorio" };
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

  static async actualizarStatus(id: number, status: EstadoEspacio) {
    const espacio = await EspacioRepository.findOneBy({ id });
    if (!espacio) {
      throw { status: 404, message: "Espacio no encontrado" };
    }

    if (!Object.values(EstadoEspacio).includes(status)) {
      throw { status: 422, message: "Status inválido" };
    }

    espacio.status = status;
    return EspacioRepository.save(espacio);
  }
}