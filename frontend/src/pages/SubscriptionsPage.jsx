import { useState, useEffect } from "react";
import { getAbonos, crearAbono, cortarAbono } from "../services/abonoService";
import { getVehiculos } from "../services/vehiculoService";
import { getEspacios } from "../services/espacioService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function SubscriptionsPage() {
  const [abonos, setAbonos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [spotId, setSpotId] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      const [resAbonos, resVehiculos, resEspacios] = await Promise.all([
        getAbonos(),
        getVehiculos(),
        getEspacios(),
      ]);
      setAbonos(resAbonos.data);
      setVehiculos(resVehiculos.data);
      setEspacios(resEspacios.data);
    } catch (err) {
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");

    if (!vehicleId || !spotId) {
      setError("Seleccioná un vehículo y un espacio");
      return;
    }

    try {
      await crearAbono({ vehicleId: Number(vehicleId), spotId: Number(spotId) });
      setVehicleId("");
      setSpotId("");
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear el abono");
    }
  };

  const handleCortar = async (abono) => {
    setError("");
    try {
      await cortarAbono(abono.id);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al cortar el abono");
    }
  };

  // Helper para mostrar la patente en vez del vehicleId crudo
  const nombreVehiculo = (id) => {
    const v = vehiculos.find((v) => v.id === id);
    return v ? v.licensePlate : id;
  };

  const columns = [
    { key: "vehicleId", label: "Vehículo", render: (row) => nombreVehiculo(row.vehicleId) },
    { key: "spotId", label: "Espacio" },
    { key: "startDate", label: "Inicio", render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: "endDate", label: "Vencimiento", render: (row) => new Date(row.endDate).toLocaleDateString() },
    { key: "amountDue", label: "Monto" },
    { key: "status", label: "Estado" },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Abonos</h1>

      <form onSubmit={handleCrear} style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} style={{ padding: "8px" }}>
          <option value="">Seleccionar vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.licensePlate} ({v.type})
            </option>
          ))}
        </select>

        <select value={spotId} onChange={(e) => setSpotId(e.target.value)} style={{ padding: "8px" }}>
          <option value="">Seleccionar espacio</option>
          {espacios.map((e) => (
            <option key={e.id} value={e.id}>
              Espacio #{e.number}
            </option>
          ))}
        </select>

        <button type="submit" style={{ padding: "8px 16px" }}>
          Crear abono
        </button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={abonos}
        renderActions={(abono) =>
          abono.status === "ACTIVE" ? (
            <button onClick={() => handleCortar(abono)} style={{ padding: "6px 12px" }}>
              Cortar abono
            </button>
          ) : (
            <span style={{ color: "#999" }}>Finalizado</span>
          )
        }
      />
    </div>
  );
}

export default SubscriptionsPage;