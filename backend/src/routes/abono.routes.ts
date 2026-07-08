import { Router } from "express";
import { AbonoController } from "../controllers/AbonoController";

const router = Router();

router.get("/", AbonoController.listar);
router.post("/", AbonoController.crear);
router.patch("/:id", AbonoController.cortarAnticipado);

export default router;