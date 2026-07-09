import { useState, useEffect } from "react";
import { getVehiculos, crearVehiculo, actualizarVehiculo } from "../services/vehiculoService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function VehiclesPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [licensePlate, setLicensePlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [type, setType] = useState("CAR");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarVehiculos = async () => {
    try {
      const res = await getVehiculos();
      setVehiculos(res.data);
    } catch (err) {
      setError("Error al cargar los vehículos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");

    if (!licensePlate || !ownerName) {
      setError("Completá la patente y el nombre del dueño");
      return;
    }

    try {
      await crearVehiculo({ licensePlate, ownerName, type });
      setLicensePlate("");
      setOwnerName("");
      setType("CAR");
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear el vehículo");
    }
  };

  const handleToggleStatus = async (vehiculo) => {
    const nuevoStatus = vehiculo.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await actualizarVehiculo(vehiculo.id, { status: nuevoStatus });
      cargarVehiculos();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el vehículo");
    }
  };

  const columns = [
    { key: "licensePlate", label: "Patente" },
    { key: "ownerName", label: "Dueño" },
    { key: "type", label: "Tipo" },
    { key: "status", label: "Estado" },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Vehículos</h1>

      <form onSubmit={handleCrear} style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Patente"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Nombre del dueño"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          style={{ padding: "8px" }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "8px" }}>
          <option value="CAR">CAR</option>
          <option value="MOTORCYCLE">MOTORCYCLE</option>
          <option value="PICKUP">PICKUP</option>
        </select>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Crear vehículo
        </button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={vehiculos}
        renderActions={(vehiculo) => (
          <button onClick={() => handleToggleStatus(vehiculo)} style={{ padding: "6px 12px" }}>
            {vehiculo.status === "ACTIVE" ? "Bloquear" : "Activar"}
          </button>
        )}
      />
    </div>
  );
}

export default VehiclesPage;