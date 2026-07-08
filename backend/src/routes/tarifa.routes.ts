import { Router } from "express";
import { TarifaController } from "../controllers/TarifaController";

const router = Router();

router.get("/", TarifaController.listar);
router.patch("/:id", TarifaController.actualizar);

export default router;