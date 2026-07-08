import { Request, Response } from "express";
import { VehiculoService } from "../services/VehiculoService";

export class VehiculoController {
  static async listar(req: Request, res: Response) {
    const vehiculos = await VehiculoService.listar();
    res.status(200).json(vehiculos);
  }

  static async crear(req: Request, res: Response) {
    try {
      const vehiculo = await VehiculoService.crear(req.body);
      res.status(201).json(vehiculo);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }

  static async actualizarStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const vehiculo = await VehiculoService.actualizarStatus(id, status);
      res.status(200).json(vehiculo);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }
}