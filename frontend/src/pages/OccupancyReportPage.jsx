import { useState, useEffect } from "react";
import { getOcupacion } from "../services/reporteService";

function OccupancyReportPage() {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarReporte = async () => {
    try {
      const res = await getOcupacion();
      setReporte(res.data);
    } catch (err) {
      setError("Error al cargar el reporte");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Reporte de ocupación</h1>
      <p className="subtitle">Estado general de la cochera en este momento.</p>

      {error && <div className="error-message">{error}</div>}

      {reporte && (
        <div className="stat-grid">
          <div className="stat-card">
            <p className="label">Espacios totales</p>
            <p className="value">{reporte.totalSpots}</p>
          </div>

          <div className="stat-card" style={{ borderTopColor: "var(--danger)" }}>
            <p className="label">Ocupados</p>
            <p className="value">{reporte.occupiedSpots}</p>
          </div>

          <div className="stat-card" style={{ borderTopColor: "var(--success)" }}>
            <p className="label">Disponibles</p>
            <p className="value">{reporte.availableSpots}</p>
          </div>

          <div className="stat-card">
            <p className="label">% de ocupación</p>
            <p className="value">{reporte.occupancyPercentage}%</p>
          </div>

          <div className="stat-card">
            <p className="label">Recaudación de hoy</p>
            <p className="value">${reporte.revenueToday}</p>
          </div>
        </div>
      )}

      <button onClick={cargarReporte} style={{ marginTop: "20px" }}>
        Actualizar
      </button>
    </div>
  );
}

export default OccupancyReportPage;