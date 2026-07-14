import { useState, useEffect } from "react";
import { getEspacios, crearEspacio, actualizarEspacio } from "../services/espacioService";
import { getSesiones } from "../services/sesionService";
import { getAbonos } from "../services/abonoService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function SpotsPage() {
  const [espacios, setEspacios] = useState([]);
  const [spotIdsOcupados, setSpotIdsOcupados] = useState(new Set());
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarEspacios = async () => {
    try {
      const [resEspacios, resSesiones, resAbonos] = await Promise.all([
        getEspacios(),
        getSesiones(),
        getAbonos(),
      ]);

      setEspacios(resEspacios.data);

      // Un espacio está ocupado si tiene una sesión activa o un abono activo reservándolo
      const idsConSesionActiva = resSesiones.data
        .filter((s) => s.status === "ACTIVE")
        .map((s) => s.spotId);
      const idsConAbonoActivo = resAbonos.data
        .filter((a) => a.status === "ACTIVE")
        .map((a) => a.spotId);

      setSpotIdsOcupados(new Set([...idsConSesionActiva, ...idsConAbonoActivo]));
    } catch (err) {
      setError("Error al cargar los espacios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEspacios();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");

    if (!numero) {
      setError("Ingresá un número de espacio");
      return;
    }

    try {
      await crearEspacio({ number: Number(numero) });
      setNumero("");
      cargarEspacios();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear el espacio");
    }
  };

  const handleToggleStatus = async (espacio) => {
    const nuevoStatus = espacio.status === "AVAILABLE" ? "OUT_OF_SERVICE" : "AVAILABLE";
    try {
      await actualizarEspacio(espacio.id, { status: nuevoStatus });
      cargarEspacios();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el espacio");
    }
  };

  const columns = [
    {
      key: "number",
      label: "Número",
      render: (row) => <span className="mono">#{row.number}</span>,
    },
    {
      key: "status",
      label: "Estado",
      render: (row) => (
        <span className={`badge ${row.status === "AVAILABLE" ? "badge-success" : "badge-danger"}`}>
          {row.status === "AVAILABLE" ? "Disponible" : "Fuera de servicio"}
        </span>
      ),
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (row) => {
        if (row.status === "OUT_OF_SERVICE") {
          return <span style={{ color: "var(--text-muted)" }}>—</span>;
        }
        const ocupado = spotIdsOcupados.has(row.id);
        return (
          <span className={`badge ${ocupado ? "badge-danger" : "badge-success"}`}>
            {ocupado ? "Ocupado" : "Libre"}
          </span>
        );
      },
    },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Espacios</h1>
      <p className="subtitle">Estado y disponibilidad de cada espacio de la cochera.</p>

      <form onSubmit={handleCrear} className="form-row">
        <input
          type="number"
          placeholder="Número de espacio"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
        <button type="submit">Crear espacio</button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={espacios}
        renderActions={(espacio) => (
          <button className="secondary" onClick={() => handleToggleStatus(espacio)}>
            {espacio.status === "AVAILABLE" ? "Marcar fuera de servicio" : "Marcar disponible"}
          </button>
        )}
      />
    </div>
  );
}

export default SpotsPage;