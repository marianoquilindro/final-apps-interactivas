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

  if (data.status && !Object.values(EstadoVehiculo).includes(data.status)) {
    throw { status: 422, message: "status inválido" };
  }

  const existente = await VehiculoRepository.findByLicensePlate(data.licensePlate);
  if (existente) {
    throw { status: 409, message: `Ya existe un vehículo con licensePlate ${data.licensePlate}` };
  }

  const vehiculo = VehiculoRepository.create({
    licensePlate: data.licensePlate,
    ownerName: data.ownerName,
    type: data.type,
    status: data.status ?? EstadoVehiculo.ACTIVE,
  });

  return VehiculoRepository.save(vehiculo);
}
}