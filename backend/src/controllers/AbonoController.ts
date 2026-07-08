import { Request, Response } from "express";
import { AbonoService } from "../services/AbonoService";

export class AbonoController {
  static async listar(req: Request, res: Response) {
    const abonos = await AbonoService.listar();
    res.status(200).json(abonos);
  }

  static async crear(req: Request, res: Response) {
    try {
      const abono = await AbonoService.crear(req.body);
      res.status(201).json(abono);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }

  static async cortarAnticipado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const abono = await AbonoService.cortarAnticipado(id);
      res.status(200).json(abono);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }
}