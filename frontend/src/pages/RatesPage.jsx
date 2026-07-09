import { useState, useEffect } from "react";
import { getTarifas, actualizarTarifa } from "../services/tarifaService";
import ErrorMessage from "../components/ErrorMessage";

function RatesPage() {
  const [tarifas, setTarifas] = useState([]);
  const [editando, setEditando] = useState(null);
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

  const traducirTipo = (type) =>
    ({ CAR: "Auto", MOTORCYCLE: "Moto", PICKUP: "Camioneta" }[type] || type);

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Tarifas</h1>
      <p className="subtitle">Tarifa vigente por hora y por mes, según tipo de vehículo.</p>

      <ErrorMessage message={error} />

      <table>
        <thead>
          <tr>
            <th>Tipo de vehículo</th>
            <th>Tarifa por hora</th>
            <th>Tarifa mensual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tarifas.map((tarifa) => (
            <tr key={tarifa.id}>
              <td>{traducirTipo(tarifa.vehicleType)}</td>
              <td className="mono">
                {editando === tarifa.id ? (
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    style={{ width: "100px" }}
                  />
                ) : (
                  `$${tarifa.hourlyRate}`
                )}
              </td>
              <td className="mono">
                {editando === tarifa.id ? (
                  <input
                    type="number"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value)}
                    style={{ width: "100px" }}
                  />
                ) : (
                  `$${tarifa.monthlyRate}`
                )}
              </td>
              <td>
                {editando === tarifa.id ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => guardarEdicion(tarifa.id)}>Guardar</button>
                    <button className="secondary" onClick={cancelarEdicion}>
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button className="secondary" onClick={() => iniciarEdicion(tarifa)}>
                    Editar
                  </button>
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