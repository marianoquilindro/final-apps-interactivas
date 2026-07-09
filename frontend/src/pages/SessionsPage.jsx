import { useState, useEffect } from "react";
import { getSesiones, checkout } from "../services/sesionService";
import { getVehiculos } from "../services/vehiculoService";
import { getEspacios } from "../services/espacioService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function SessionsPage() {
  const [sesiones, setSesiones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const [resSesiones, resVehiculos, resEspacios] = await Promise.all([
        getSesiones(),
        getVehiculos(),
        getEspacios(),
      ]);
      setSesiones(resSesiones.data);
      setVehiculos(resVehiculos.data);
      setEspacios(resEspacios.data);
    } catch (err) {
      setError("Error al cargar las sesiones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCheckout = async (sesion) => {
    setError("");
    try {
      await checkout(sesion.id);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el egreso");
    }
  };

  const nombreVehiculo = (id) => {
    const v = vehiculos.find((v) => v.id === id);
    return v ? v.licensePlate : id;
  };

  const numeroEspacio = (spotId) => {
    const e = espacios.find((e) => e.id === spotId);
    return e ? e.number : spotId;
  };

  const formatearFecha = (fecha) => (fecha ? new Date(fecha).toLocaleString() : "—");

  const columns = [
    {
      key: "vehicleId",
      label: "Vehículo",
      render: (row) => <span className="plate">{nombreVehiculo(row.vehicleId)}</span>,
    },
    { key: "spotId", label: "Espacio", render: (row) => <span className="mono">#{numeroEspacio(row.spotId)}</span> },
    { key: "entryTime", label: "Ingreso", render: (row) => formatearFecha(row.entryTime) },
    { key: "exitTime", label: "Egreso", render: (row) => formatearFecha(row.exitTime) },
    {
      key: "amountDue",
      label: "Monto",
      render: (row) => <span className="mono">{row.amountDue !== null ? `$${row.amountDue}` : "—"}</span>,
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span className={`badge ${row.status === "ACTIVE" ? "badge-success" : "badge-neutral"}`}>
          {row.status === "ACTIVE" ? "Activa" : "Finalizada"}
        </span>
      ),
    },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Sesiones</h1>
      <p className="subtitle">Registro de ingresos y egresos de la cochera.</p>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={sesiones}
        renderActions={(sesion) =>
          sesion.status === "ACTIVE" ? (
            <button className="secondary" onClick={() => handleCheckout(sesion)}>
              Registrar egreso
            </button>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>—</span>
          )
        }
      />
    </div>
  );
}

export default SessionsPage;