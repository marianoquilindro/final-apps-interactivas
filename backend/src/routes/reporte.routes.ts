import { Router } from "express";
import { ReporteController } from "../controllers/ReporteController";

const router = Router();

router.get("/occupancy", ReporteController.ocupacion);

export default router;