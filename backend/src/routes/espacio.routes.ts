import { Router } from "express";
import { EspacioController } from "../controllers/EspacioController";

const router = Router();

router.get("/", EspacioController.listar);
router.post("/", EspacioController.crear);
router.patch("/:id", EspacioController.actualizarStatus);

export default router;