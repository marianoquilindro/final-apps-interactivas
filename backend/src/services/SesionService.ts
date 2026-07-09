import { SesionRepository } from "../repositories/SesionRepository";
import { EspacioRepository } from "../repositories/EspacioRepository";
import { VehiculoRepository } from "../repositories/VehiculoRepository";
import { AbonoRepository } from "../repositories/AbonoRepository";
import { TarifaRepository } from "../repositories/TarifaRepository";
import { EstadoEspacio } from "../entities/Espacio";
import { EstadoVehiculo, TipoVehiculo } from "../entities/Vehiculo";
import { EstadoSesion } from "../entities/Sesion";
import { AppDataSource } from "../config/data-source";

export class SesionService {
  static async listar() {
    return SesionRepository.find();
  }

  static async checkIn(data: {
    licensePlate: string;
    ownerName?: string;
    type?: TipoVehiculo;
  }) {
    if (!data.licensePlate || typeof data.licensePlate !== "string") {
      throw { status: 422, message: "licensePlate es obligatorio y debe ser un string" };
    }
    data.licensePlate = data.licensePlate.trim().toUpperCase();

    // 1) Buscar el vehículo, o crearlo si es patente nueva
    let vehiculo = await VehiculoRepository.findByLicensePlate(data.licensePlate);

    if (!vehiculo) {
      if (!data.ownerName || !data.type) {
        throw {
          status: 422,
          message: "Vehículo no existe: ownerName y type son obligatorios para darlo de alta",
        };
      }
      if (!Object.values(TipoVehiculo).includes(data.type)) {
        throw { status: 422, message: "type inválido" };
      }
      vehiculo = await VehiculoRepository.save(
        VehiculoRepository.create({
          licensePlate: data.licensePlate,
          ownerName: data.ownerName,
          type: data.type,
          status: EstadoVehiculo.ACTIVE,
        })
      );
    }

    // 2) Regla 2: vehículo BLOCKED no puede iniciar sesión
    if (vehiculo.status === EstadoVehiculo.BLOCKED) {
      throw { status: 409, message: "El vehículo está BLOCKED, no puede ingresar" };
    }

    // 3) Regla 6: no puede haber ya una sesión ACTIVE para este vehículo
    const sesionActivaVehiculo = await SesionRepository.findActiveByVehicle(vehiculo.id);
    if (sesionActivaVehiculo) {
      throw { status: 409, message: "El vehículo ya tiene una sesión activa" };
    }

    // 4) Verificar si tiene un abono ACTIVE vigente
    const abono = await AbonoRepository.findActiveByVehicle(vehiculo.id);

    if (abono) {
      // Regla 4: ingreso de vehículo abonado, usa el espacio reservado, amountDue = 0
      const sesion = SesionRepository.create({
        entryTime: new Date(),
        exitTime: null,
        amountDue: 0,
        status: EstadoSesion.ACTIVE,
        vehicleId: vehiculo.id,
        spotId: abono.spotId,
        subscriptionId: abono.id,
      });
      return SesionRepository.save(sesion);
    }

    // 5) Regla 3: check-in ocasional, asignar el primer espacio AVAILABLE
    // que no esté reservado por un abono ACTIVE (regla 5: exclusividad)
    const espaciosDisponibles = await EspacioRepository.find({
      where: { status: EstadoEspacio.AVAILABLE },
      order: { number: "ASC" },
    });

    let espacioAsignado = null;
    for (const espacio of espaciosDisponibles) {
      const reservadoPorAbono = await AbonoRepository.findActiveBySpot(espacio.id);
      if (!reservadoPorAbono) {
        espacioAsignado = espacio;
        break;
      }
    }

    if (!espacioAsignado) {
      throw { status: 409, message: "No hay espacios disponibles" };
    }

    const sesion = SesionRepository.create({
      entryTime: new Date(),
      exitTime: null,
      amountDue: null,
      status: EstadoSesion.ACTIVE,
      vehicleId: vehiculo.id,
      spotId: espacioAsignado.id,
      subscriptionId: null,
    });

    return SesionRepository.save(sesion);
  }

  static async checkout(id: number) {
    const sesion = await SesionRepository.findOneBy({ id });
    if (!sesion) {
      throw { status: 404, message: "Sesión no encontrada" };
    }

    // Regla 8: no se puede volver a finalizar una sesión ya COMPLETED
    if (sesion.status === EstadoSesion.COMPLETED) {
      throw { status: 409, message: "La sesión ya está finalizada" };
    }

    const exitTime = new Date();
    let amountDue = 0;

    if (!sesion.subscriptionId) {
      // Sin abono: hourlyRate × horas transcurridas, redondeadas hacia arriba
      const vehiculo = await VehiculoRepository.findOneBy({ id: sesion.vehicleId });
      if (!vehiculo) {
        throw { status: 500, message: "Vehículo asociado a la sesión no encontrado" };
      }
      const tarifa = await TarifaRepository.findByVehicleType(vehiculo.type);
      if (!tarifa) {
        throw { status: 500, message: `No existe tarifa configurada para ${vehiculo.type}` };
      }

      const msTranscurridos = exitTime.getTime() - new Date(sesion.entryTime).getTime();
      const horas = Math.ceil(msTranscurridos / (60 * 60 * 1000));
      amountDue = Number(tarifa.hourlyRate) * Math.max(horas, 1);
    }
    // Si tiene abono, amountDue queda en 0 (ya fue cobrado por adelantado)

    sesion.status = EstadoSesion.COMPLETED;
    sesion.exitTime = exitTime;
    sesion.amountDue = amountDue;

    return SesionRepository.save(sesion);
  }
}