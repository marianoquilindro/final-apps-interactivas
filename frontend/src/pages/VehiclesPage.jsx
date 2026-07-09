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

  const traducirTipo = (type) =>
    ({ CAR: "Auto", MOTORCYCLE: "Moto", PICKUP: "Camioneta" }[type] || type);

  const columns = [
    { key: "licensePlate", label: "Patente", render: (row) => <span className="plate">{row.licensePlate}</span> },
    { key: "ownerName", label: "Dueño" },
    { key: "type", label: "Tipo", render: (row) => traducirTipo(row.type) },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span className={`badge ${row.status === "ACTIVE" ? "badge-success" : "badge-danger"}`}>
          {row.status === "ACTIVE" ? "Activo" : "Bloqueado"}
        </span>
      ),
    },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Vehículos</h1>
      <p className="subtitle">Vehículos registrados en el sistema.</p>

      <form onSubmit={handleCrear} className="form-row">
        <input
          type="text"
          placeholder="Patente"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre del dueño"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CAR">Auto</option>
          <option value="MOTORCYCLE">Moto</option>
          <option value="PICKUP">Camioneta</option>
        </select>
        <button type="submit">Crear vehículo</button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={vehiculos}
        renderActions={(vehiculo) => (
          <button className="secondary" onClick={() => handleToggleStatus(vehiculo)}>
            {vehiculo.status === "ACTIVE" ? "Bloquear" : "Activar"}
          </button>
        )}
      />
    </div>
  );
}

export default VehiclesPage;