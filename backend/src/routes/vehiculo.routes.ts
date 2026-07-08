import { Router } from "express";
import { VehiculoController } from "../controllers/VehiculoController";

const router = Router();

router.get("/", VehiculoController.listar);
router.post("/", VehiculoController.crear);
router.patch("/:id", VehiculoController.actualizarStatus);

export default router;