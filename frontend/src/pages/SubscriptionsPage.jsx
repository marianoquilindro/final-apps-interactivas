import { useState, useEffect } from "react";
import { getAbonos, crearAbono, cortarAbono } from "../services/abonoService";
import { getVehiculos } from "../services/vehiculoService";
import { getEspacios } from "../services/espacioService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";
import { getSesiones } from "../services/sesionService";

function SubscriptionsPage() {
  const [abonos, setAbonos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [vehicleId, setVehicleId] = useState("");
  const [spotId, setSpotId] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const [espaciosConEstado, setEspaciosConEstado] = useState([]);

  const cargarDatos = async () => {
    try {
      const [resAbonos, resVehiculos, resEspacios, resSesiones] = await Promise.all([
        getAbonos(),
        getVehiculos(),
        getEspacios(),
        getSesiones(),
      ]);
      setAbonos(resAbonos.data);
      setVehiculos(resVehiculos.data);
      setEspacios(resEspacios.data);

      const idsConSesionActiva = new Set(
        resSesiones.data.filter((s) => s.status === "ACTIVE").map((s) => s.spotId)
      );
      const idsConAbonoActivo = new Set(
        resAbonos.data.filter((a) => a.status === "ACTIVE").map((a) => a.spotId)
      );

      const conEstado = resEspacios.data.map((e) => {
        let estado = "Disponible";
        let disabled = false;

        if (e.status === "OUT_OF_SERVICE") {
          estado = "Fuera de servicio";
          disabled = true;
        } else if (idsConAbonoActivo.has(e.id)) {
          estado = "Reservado por otro abono";
          disabled = true;
        } else if (idsConSesionActiva.has(e.id)) {
          estado = "Ocupado ahora";
          // No lo deshabilitamos: un auto ocasional puede irse y liberar el lugar
          // antes de que el abono empiece a usarse, así que no es un impedimento real.
        }

        return { ...e, estadoLabel: estado, disabled };
      });

      setEspaciosConEstado(conEstado);
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

  const nombreVehiculo = (id) => {
    const v = vehiculos.find((v) => v.id === id);
    return v ? v.licensePlate : id;
  };

  const numeroEspacio = (spotId) => {
    const e = espacios.find((e) => e.id === spotId);
    return e ? e.number : spotId;
  };

  const columns = [
    {
      key: "vehicleId",
      label: "Vehículo",
      render: (row) => <span className="plate">{nombreVehiculo(row.vehicleId)}</span>,
    },
    { key: "spotId", label: "Espacio", render: (row) => <span className="mono">#{numeroEspacio(row.spotId)}</span> },
    { key: "startDate", label: "Inicio", render: (row) => new Date(row.startDate).toLocaleDateString() },
    { key: "endDate", label: "Vencimiento", render: (row) => new Date(row.endDate).toLocaleDateString() },
    { key: "amountDue", label: "Monto", render: (row) => <span className="mono">${row.amountDue}</span> },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span className={`badge ${row.status === "ACTIVE" ? "badge-success" : "badge-neutral"}`}>
          {row.status === "ACTIVE" ? "Activo" : "Finalizado"}
        </span>
      ),
    },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Abonos</h1>
      <p className="subtitle">Reservas mensuales de espacio para vehículos frecuentes.</p>

      <form onSubmit={handleCrear} className="form-row">
        <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
          <option value="">Seleccionar vehículo</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.licensePlate} ({v.type})
            </option>
          ))}
        </select>

        <select value={spotId} onChange={(e) => setSpotId(e.target.value)}>
          <option value="">Seleccionar espacio</option>
          {espaciosConEstado.map((e) => (
            <option key={e.id} value={e.id} disabled={e.disabled}>
              Espacio #{e.number} — {e.estadoLabel}
            </option>
          ))}
        </select>

        <button type="submit">Crear abono</button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={abonos}
        renderActions={(abono) =>
          abono.status === "ACTIVE" ? (
            <button className="secondary" onClick={() => handleCortar(abono)}>
              Cortar abono
            </button>
          ) : (
            <span style={{ color: "var(--text-muted)" }}>—</span>
          )
        }
      />
    </div>
  );
}

export default SubscriptionsPage;