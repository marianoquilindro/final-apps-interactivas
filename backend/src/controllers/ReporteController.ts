import { Request, Response } from "express";
import { ReporteService } from "../services/ReporteService";

export class ReporteController {
  static async ocupacion(req: Request, res: Response) {
    const reporte = await ReporteService.ocupacion();
    res.status(200).json(reporte);
  }
}