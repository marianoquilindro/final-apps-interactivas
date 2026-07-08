import { Request, Response } from "express";
import { SesionService } from "../services/SesionService";

export class SesionController {
  static async listar(req: Request, res: Response) {
    const sesiones = await SesionService.listar();
    res.status(200).json(sesiones);
  }

  static async checkIn(req: Request, res: Response) {
    try {
      const sesion = await SesionService.checkIn(req.body);
      res.status(201).json(sesion);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }

  static async checkout(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const sesion = await SesionService.checkout(id);
      res.status(200).json(sesion);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }
}