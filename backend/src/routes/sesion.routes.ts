import { Router } from "express";
import { SesionController } from "../controllers/SesionController";

const router = Router();

router.get("/", SesionController.listar);
router.post("/", SesionController.checkIn);
router.patch("/:id", SesionController.checkout);

export default router;