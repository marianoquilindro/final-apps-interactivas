import { useState, useEffect } from "react";
import { getTarifas, actualizarTarifa } from "../services/tarifaService";
import ErrorMessage from "../components/ErrorMessage";

function RatesPage() {
  const [tarifas, setTarifas] = useState([]);
  const [editando, setEditando] = useState(null); // id de la tarifa en edición
  const [hourlyRate, setHourlyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarTarifas = async () => {
    try {
      const res = await getTarifas();
      setTarifas(res.data);
    } catch (err) {
      setError("Error al cargar las tarifas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const iniciarEdicion = (tarifa) => {
    setEditando(tarifa.id);
    setHourlyRate(tarifa.hourlyRate);
    setMonthlyRate(tarifa.monthlyRate);
    setError("");
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setHourlyRate("");
    setMonthlyRate("");
  };

  const guardarEdicion = async (id) => {
    setError("");
    try {
      await actualizarTarifa(id, {
        hourlyRate: Number(hourlyRate),
        monthlyRate: Number(monthlyRate),
      });
      cancelarEdicion();
      cargarTarifas();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar la tarifa");
    }
  };

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Tarifas</h1>

      <ErrorMessage message={error} />

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
        <thead>
          <tr style={{ backgroundColor: "#e5e7eb", textAlign: "left" }}>
            <th style={{ padding: "10px" }}>Tipo de vehículo</th>
            <th style={{ padding: "10px" }}>Tarifa por hora</th>
            <th style={{ padding: "10px" }}>Tarifa mensual</th>
            <th style={{ padding: "10px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tarifas.map((tarifa) => (
            <tr key={tarifa.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{tarifa.vehicleType}</td>
              <td style={{ padding: "10px" }}>
                {editando === tarifa.id ? (
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={{ padding: "6px", width: "100px" }}
                  />
                ) : (
                  `$${tarifa.hourlyRate}`
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === tarifa.id ? (
                  <input
                    type="number"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value)}
                    style={{ padding: "6px", width: "100px" }}
                  />
                ) : (
                  `$${tarifa.monthlyRate}`
                )}
              </td>
              <td style={{ padding: "10px" }}>
                {editando === tarifa.id ? (
                  <>
                    <button onClick={() => guardarEdicion(tarifa.id)} style={{ marginRight: "6px" }}>
                      Guardar
                    </button>
                    <button onClick={cancelarEdicion}>Cancelar</button>
                  </>
                ) : (
                  <button onClick={() => iniciarEdicion(tarifa)}>Editar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RatesPage;