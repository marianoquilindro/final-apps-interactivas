import { useState, useEffect } from "react";
import { getOcupacion } from "../services/reporteService";
import ErrorMessage from "../components/ErrorMessage";

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

      <ErrorMessage message={error} />

      {reporte && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div style={{ backgroundColor: "#e5e7eb", padding: "20px", borderRadius: "8px" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>Espacios totales</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{reporte.totalSpots}</p>
          </div>

          <div style={{ backgroundColor: "#fee2e2", padding: "20px", borderRadius: "8px" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>Ocupados</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{reporte.occupiedSpots}</p>
          </div>

          <div style={{ backgroundColor: "#dcfce7", padding: "20px", borderRadius: "8px" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>Disponibles</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{reporte.availableSpots}</p>
          </div>

          <div style={{ backgroundColor: "#dbeafe", padding: "20px", borderRadius: "8px" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>% de ocupación</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{reporte.occupancyPercentage}%</p>
          </div>

          <div style={{ backgroundColor: "#fef9c3", padding: "20px", borderRadius: "8px" }}>
            <p style={{ color: "#666", fontSize: "14px" }}>Recaudación de hoy</p>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>${reporte.revenueToday}</p>
          </div>
        </div>
      )}

      <button onClick={cargarReporte} style={{ marginTop: "20px", padding: "8px 16px" }}>
        Actualizar
      </button>
    </div>
  );
}

export default OccupancyReportPage;