import { useState, useEffect } from "react";
import { getSesiones, checkout } from "../services/sesionService";
import { getVehiculos } from "../services/vehiculoService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function SessionsPage() {
  const [sesiones, setSesiones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const [resSesiones, resVehiculos] = await Promise.all([getSesiones(), getVehiculos()]);
      setSesiones(resSesiones.data);
      setVehiculos(resVehiculos.data);
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

  const formatearFecha = (fecha) => (fecha ? new Date(fecha).toLocaleString() : "-");

  const columns = [
    { key: "vehicleId", label: "Vehículo", render: (row) => nombreVehiculo(row.vehicleId) },
    { key: "spotId", label: "Espacio" },
    { key: "entryTime", label: "Ingreso", render: (row) => formatearFecha(row.entryTime) },
    { key: "exitTime", label: "Egreso", render: (row) => formatearFecha(row.exitTime) },
    {
      key: "amountDue",
      label: "Monto",
      render: (row) => (row.amountDue !== null ? `$${row.amountDue}` : "-"),
    },
    { key: "status", label: "Estado" },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Sesiones</h1>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={sesiones}
        renderActions={(sesion) =>
          sesion.status === "ACTIVE" ? (
            <button onClick={() => handleCheckout(sesion)} style={{ padding: "6px 12px" }}>
              Registrar egreso
            </button>
          ) : (
            <span style={{ color: "#999" }}>Finalizada</span>
          )
        }
      />
    </div>
  );
}

export default SessionsPage;