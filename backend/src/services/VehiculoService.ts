import { VehiculoRepository } from "../repositories/VehiculoRepository";
import { TipoVehiculo, EstadoVehiculo } from "../entities/Vehiculo";

export class VehiculoService {
  static async listar() {
    return VehiculoRepository.find();
  }

  static async crear(data: {
    licensePlate: string;
    ownerName: string;
    type: TipoVehiculo;
    status?: EstadoVehiculo;
  }) {
    if (
      !data.licensePlate || typeof data.licensePlate !== "string" ||
      !data.ownerName || typeof data.ownerName !== "string" ||
      !data.type
    ) {
      throw { status: 422, message: "licensePlate, ownerName y type son obligatorios y deben tener formato válido" };
    }

    if (!Object.values(TipoVehiculo).includes(data.type)) {
      throw { status: 422, message: "type inválido" };
    }
    data.licensePlate = data.licensePlate.trim().toUpperCase();

    if (data.status && !Object.values(EstadoVehiculo).includes(data.status)) {
      throw { status: 422, message: "status inválido" };
    }

    const existente = await VehiculoRepository.findByLicensePlate(data.licensePlate);
    if (existente) {
      throw { status: 409, message: `Ya existe un vehículo con esa patente ${data.licensePlate}` };
    }

    const vehiculo = VehiculoRepository.create({
      licensePlate: data.licensePlate,
      ownerName: data.ownerName,
      type: data.type,
      status: data.status ?? EstadoVehiculo.ACTIVE,
    });

    return VehiculoRepository.save(vehiculo);
  }

  static async actualizarStatus(id: number, status: EstadoVehiculo) {
    const vehiculo = await VehiculoRepository.findOneBy({ id });
    if (!vehiculo) {
      throw { status: 404, message: "Vehículo no encontrado" };
    }

    if (!Object.values(EstadoVehiculo).includes(status)) {
      throw { status: 422, message: "Status inválido" };
    }

    vehiculo.status = status;
    return VehiculoRepository.save(vehiculo);
  }
}