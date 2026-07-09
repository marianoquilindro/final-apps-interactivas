import { useState, useEffect } from "react";
import { checkIn } from "../services/sesionService";
import { getEspacios } from "../services/espacioService";
import ErrorMessage from "../components/ErrorMessage";

function SessionFormPage() {
  const [licensePlate, setLicensePlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [type, setType] = useState("CAR");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(null);
  const [espacios, setEspacios] = useState([]);

  useEffect(() => {
    getEspacios()
      .then((res) => setEspacios(res.data))
      .catch(() => {});
  }, []);

  const numeroEspacio = (spotId) => {
    const e = espacios.find((e) => e.id === spotId);
    return e ? e.number : spotId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito(null);

    if (!licensePlate) {
      setError("Ingresá la patente del vehículo");
      return;
    }

    const payload = { licensePlate };
    if (ownerName) payload.ownerName = ownerName;
    if (type) payload.type = type;

    try {
      const res = await checkIn(payload);
      setExito(res.data);
      setLicensePlate("");
      setOwnerName("");
      setType("CAR");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el ingreso");
    }
  };

  return (
    <div>
      <h1>Ingreso de vehículo</h1>
      <p className="subtitle">
        Ingresá la patente. Si el vehículo tiene un abono vigente, el ingreso queda sin costo. Si es
        una patente nueva, completá también el dueño y el tipo.
      </p>

      <form onSubmit={handleSubmit} className="form-row">
        <input
          type="text"
          placeholder="Patente"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre del dueño (si es nuevo)"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="CAR">Auto</option>
          <option value="MOTORCYCLE">Moto</option>
          <option value="PICKUP">Camioneta</option>
        </select>
        <button type="submit">Registrar ingreso</button>
      </form>

      <ErrorMessage message={error} />

      {exito && (
        <div className="success-message">
          Ingreso registrado. Espacio asignado: <span className="mono">#{numeroEspacio(exito.spotId)}</span>
          {exito.subscriptionId ? " · vehículo abonado, sin costo" : ""}
        </div>
      )}
    </div>
  );
}

export default SessionFormPage;