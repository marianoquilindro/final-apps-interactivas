import { useState, useEffect } from "react";
import { getEspacios, crearEspacio, actualizarEspacio } from "../services/espacioService";
import Table from "../components/Table";
import ErrorMessage from "../components/ErrorMessage";

function SpotsPage() {
  const [espacios, setEspacios] = useState([]);
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarEspacios = async () => {
    try {
      const res = await getEspacios();
      setEspacios(res.data);
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
    { key: "number", label: "Número" },
    { key: "status", label: "Estado" },
  ];

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Espacios</h1>

      <form onSubmit={handleCrear} style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        <input
          type="number"
          placeholder="Número de espacio"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Crear espacio
        </button>
      </form>

      <ErrorMessage message={error} />

      <Table
        columns={columns}
        data={espacios}
        renderActions={(espacio) => (
          <button onClick={() => handleToggleStatus(espacio)} style={{ padding: "6px 12px" }}>
            {espacio.status === "AVAILABLE" ? "Marcar fuera de servicio" : "Marcar disponible"}
          </button>
        )}
      />
    </div>
  );
}

export default SpotsPage;