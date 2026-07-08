import { Request, Response } from "express";
import { EspacioService } from "../services/EspacioService";

export class EspacioController {
  static async listar(req: Request, res: Response) {
    const espacios = await EspacioService.listar();
    res.status(200).json(espacios);
  }

  static async crear(req: Request, res: Response) {
    try {
      const espacio = await EspacioService.crear(req.body);
      res.status(201).json(espacio);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }

  static async actualizarStatus(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const espacio = await EspacioService.actualizarStatus(id, status);
      res.status(200).json(espacio);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Error interno" });
    }
  }
}