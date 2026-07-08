import "reflect-metadata";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import espacioRoutes from "./routes/espacio.routes"
import vehiculoRoutes from "./routes/vehiculo.routes"
import tarifaRoutes from "./routes/tarifa.routes"
import abonoRoutes from "./routes/abono.routes"
import sesionRoutes from "./routes/sesion.routes"
import reporteRoutes from "./routes/reporte.routes"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexión a la base de datos establecida");

    app.get("/", (req, res) => {
      res.json({ message: "API de Cochera funcionando" });
    });

    app.use("/spots", espacioRoutes);
    app.use("/vehicles",vehiculoRoutes);
    app.use("/rates", tarifaRoutes);
    app.use("/subscriptions", abonoRoutes);
    app.use("/sessions", sesionRoutes);
    app.use("/reports", reporteRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
  });