import { EspacioRepository } from "../repositories/EspacioRepository";
import { SesionRepository } from "../repositories/SesionRepository";
import { AbonoRepository } from "../repositories/AbonoRepository";
import { EstadoSesion } from "../entities/Sesion";
import { EstadoAbono } from "../entities/Abono";
import { EstadoEspacio } from "../entities/Espacio";

export class ReporteService {
  static async ocupacion() {
    const totalSpots = await EspacioRepository.count();
    const outOfServiceSpots = await EspacioRepository.count({ where: { status: EstadoEspacio.OUT_OF_SERVICE } });

    // Espacios ocupados: con sesión ACTIVE, o reservados por un abono ACTIVE
    const spotIdsConSesionActiva = (
      await SesionRepository.find({ where: { status: EstadoSesion.ACTIVE } })
    ).map((s) => s.spotId);

    const spotIdsConAbonoActivo = (
      await AbonoRepository.find({ where: { status: EstadoAbono.ACTIVE } })
    ).map((a) => a.spotId);

    const spotIdsOcupados = new Set([...spotIdsConSesionActiva, ...spotIdsConAbonoActivo]);
    const occupiedSpots = spotIdsOcupados.size;

    const availableSpots = totalSpots - occupiedSpots - outOfServiceSpots;
    const occupancyPercentage = totalSpots > 0 ? (occupiedSpots / totalSpots) * 100 : 0;

    // Revenue de hoy: sesiones ocasionales completadas hoy + abonos dados de alta hoy
    const inicioDeHoy = new Date();
    inicioDeHoy.setHours(0, 0, 0, 0);
    const finDeHoy = new Date();
    finDeHoy.setHours(23, 59, 59, 999);

    const sesionesCompletadasHoy = await SesionRepository.createQueryBuilder("sesion")
      .where("sesion.status = :status", { status: EstadoSesion.COMPLETED })
      .andWhere("sesion.exitTime BETWEEN :inicio AND :fin", {
        inicio: inicioDeHoy,
        fin: finDeHoy,
      })
      .getMany();

    const revenueSesiones = sesionesCompletadasHoy.reduce(
      (acc, s) => acc + Number(s.amountDue || 0),
      0
    );

    const abonosDeHoy = await AbonoRepository.createQueryBuilder("abono")
      .where("abono.startDate BETWEEN :inicio AND :fin", {
        inicio: inicioDeHoy,
        fin: finDeHoy,
      })
      .getMany();

    const revenueAbonos = abonosDeHoy.reduce((acc, a) => acc + Number(a.amountDue), 0);

    const revenueToday = revenueSesiones + revenueAbonos;

    return {
      totalSpots,
      occupiedSpots,
      availableSpots,
      occupancyPercentage: Number(occupancyPercentage.toFixed(2)),
      revenueToday,
    };
  }
}