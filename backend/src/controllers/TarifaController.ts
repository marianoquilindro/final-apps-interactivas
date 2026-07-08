import { Request, Response } from "express";
import { TarifaService } from "../services/TarifaService";

export class TarifaController {
  static async listar(req: Request, res: Response) {
    const tarifas = await TarifaService.listar();
    res.status(200).json(tarifas);
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const tarifa = await TarifaService.actualizar(id, req.body);
      res.status(200).json(tarifa);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }
}