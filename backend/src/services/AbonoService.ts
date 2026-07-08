import { AbonoRepository } from "../repositories/AbonoRepository";
import { SesionRepository } from "../repositories/SesionRepository";
import { EspacioRepository } from "../repositories/EspacioRepository";
import { VehiculoRepository } from "../repositories/VehiculoRepository";
import { TarifaRepository } from "../repositories/TarifaRepository";
import { EstadoEspacio } from "../entities/Espacio";
import { EstadoVehiculo } from "../entities/Vehiculo";
import { EstadoAbono } from "../entities/Abono";

export class AbonoService {
  static async listar() {
    return AbonoRepository.find();
  }

  static async crear(data: { vehicleId: number; spotId: number }) {
    if (!data.vehicleId || !data.spotId) {
      throw { status: 422, message: "vehicleId y spotId son obligatorios" };
    }

    // 1) Validar que el vehículo exista y no esté BLOCKED
    const vehiculo = await VehiculoRepository.findOneBy({ id: data.vehicleId });
    if (!vehiculo) {
      throw { status: 404, message: "Vehículo no encontrado" };
    }
    if (vehiculo.status === EstadoVehiculo.BLOCKED) {
      throw { status: 409, message: "El vehículo está BLOCKED, no puede tener un abono" };
    }

    // 2) Validar que el espacio exista y no esté OUT_OF_SERVICE
    const espacio = await EspacioRepository.findOneBy({ id: data.spotId });
    if (!espacio) {
      throw { status: 404, message: "Espacio no encontrado" };
    }
    if (espacio.status === EstadoEspacio.OUT_OF_SERVICE) {
      throw { status: 409, message: "El espacio está OUT_OF_SERVICE, no puede reservarse" };
    }

    // 3) Validar que el espacio no esté reservado por otro abono ACTIVE
    const abonoExistenteEnEspacio = await AbonoRepository.findActiveBySpot(data.spotId);
    if (abonoExistenteEnEspacio) {
      throw { status: 409, message: "El espacio ya está reservado por otro abono activo" };
    }

    // 4) Buscar la tarifa correspondiente al tipo de vehículo
    const tarifa = await TarifaRepository.findByVehicleType(vehiculo.type);
    if (!tarifa) {
      throw { status: 500, message: `No existe tarifa configurada para ${vehiculo.type}` };
    }

    // 5) Calcular fechas y monto automáticamente (el cliente no puede enviarlas)
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const abono = AbonoRepository.create({
      startDate,
      endDate,
      amountDue: tarifa.monthlyRate,
      status: EstadoAbono.ACTIVE,
      vehicleId: vehiculo.id,
      spotId: espacio.id,
    });

    return AbonoRepository.save(abono);
  }

  static async cortarAnticipado(id: number) {
    const abono = await AbonoRepository.findOneBy({ id });
    if (!abono) {
      throw { status: 404, message: "Abono no encontrado" };
    }

    if (abono.status === EstadoAbono.COMPLETED) {
      throw { status: 409, message: "El abono ya está finalizado" };
    }

    // Regla 10: no puede haber una sesión ACTIVE abierta bajo este abono
    const sesionActiva = await SesionRepository.findActiveBySubscription(abono.id);
    if (sesionActiva) {
      throw { status: 409, message: "Hay una sesión activa bajo este abono, el vehículo debe egresar primero" };
    }

    abono.status = EstadoAbono.COMPLETED;
    return AbonoRepository.save(abono);
    // Nota: el espacio queda libre automáticamente porque la "reserva" no es un campo
    // en Espacio, sino que se calcula dinámicamente buscando abonos ACTIVE por spotId.
  }
}