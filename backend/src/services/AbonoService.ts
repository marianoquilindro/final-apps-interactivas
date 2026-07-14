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
    if (
      !data.vehicleId || typeof data.vehicleId !== "number" ||
      !data.spotId || typeof data.spotId !== "number"
    ) {
      throw { status: 422, message: "vehicleId y spotId son obligatorios y deben ser numéricos" };
    }

    // Validar que el vehículo exista y no esté bloqueado
    const vehiculo = await VehiculoRepository.findOneBy({ id: data.vehicleId });
    if (!vehiculo) {
      throw { status: 404, message: "Vehículo no encontrado" };
    }
    if (vehiculo.status === EstadoVehiculo.BLOCKED) {
      throw { status: 409, message: "El vehículo está bloqueado, no puede tener un abono" };
    }

    const abonoActivoDelVehiculo = await AbonoRepository.findActiveByVehicle(vehiculo.id);
    if (abonoActivoDelVehiculo) {
      throw { status: 409, message: "El vehículo ya tiene un abono activo vigente" };
    }

    // Validar que el espacio exista y no este fuera de servicio
    const espacio = await EspacioRepository.findOneBy({ id: data.spotId });
    if (!espacio) {
      throw { status: 404, message: "Espacio no encontrado" };
    }
    if (espacio.status === EstadoEspacio.OUT_OF_SERVICE) {
      throw { status: 409, message: "El espacio está fuera de servicio, no puede reservarse" };
    }

    // Validar que el espacio no este reservado por otro abono
    const abonoExistenteEnEspacio = await AbonoRepository.findActiveBySpot(data.spotId);
    if (abonoExistenteEnEspacio) {
      throw { status: 409, message: "El espacio ya está reservado por otro abono activo" };
    }

    // Buscar la tarifa correspondiente al tipo de vehículo
    const tarifa = await TarifaRepository.findByVehicleType(vehiculo.type);
    if (!tarifa) {
      throw { status: 500, message: `No existe tarifa configurada para ${vehiculo.type}` };
    }

    // Calcular fechas y monto automáticamente
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

    // No puede haber una sesión ACTIVE abierta bajo este abono
    const sesionActiva = await SesionRepository.findActiveBySubscription(abono.id);
    if (sesionActiva) {
      throw { status: 409, message: "Hay una sesión activa bajo este abono, el vehículo debe egresar primero" };
    }

    abono.status = EstadoAbono.COMPLETED;
    return AbonoRepository.save(abono);
    
  }
}