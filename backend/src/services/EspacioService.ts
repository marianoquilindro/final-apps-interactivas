import { EspacioRepository } from "../repositories/EspacioRepository";
import { EstadoEspacio } from "../entities/Espacio";
import { SesionRepository } from "../repositories/SesionRepository";
import { AbonoRepository } from "../repositories/AbonoRepository";

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

  static async actualizarStatus(id: number, status: EstadoEspacio) {
    const espacio = await EspacioRepository.findOneBy({ id });
    if (!espacio) {
      throw { status: 404, message: "Espacio no encontrado" };
    }

    if (!Object.values(EstadoEspacio).includes(status)) {
      throw { status: 422, message: "Status inválido" };
    }
    if (status === EstadoEspacio.OUT_OF_SERVICE) {
      const sesionActiva = await SesionRepository.findActiveBySpot(espacio.id);
      if (sesionActiva) {
        throw {
          status: 409,
          message: "No se puede marcar fuera de servicio: hay un vehículo estacionado en este espacio",
        };
      }

      const abonoActivo = await AbonoRepository.findActiveBySpot(espacio.id);
      if (abonoActivo) {
        throw {
          status: 409,
          message: "No se puede marcar fuera de servicio: el espacio está reservado por un abono activo",
        };
      }
    }

    espacio.status = status;
    return EspacioRepository.save(espacio);
  }
}