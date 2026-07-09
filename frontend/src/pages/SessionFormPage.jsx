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
      <p style={{ color: "#666", marginTop: "8px" }}>
        Ingresá la patente. Si el vehículo ya tiene un abono vigente, se registrará el ingreso sin
        cobrar. Si es un vehículo nuevo, completá también el nombre del dueño y el tipo.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Patente"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Nombre del dueño (si es nuevo)"
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
          Registrar ingreso
        </button>
      </form>

      <ErrorMessage message={error} />

      {exito && (
        <div
          style={{
            backgroundColor: "#dcfce7",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "6px",
            marginTop: "12px",
          }}
        >
          Ingreso registrado con éxito. Espacio asignado: #{numeroEspacio(exito.spotId)}
          {exito.subscriptionId ? " (vehículo abonado, sin costo)" : ""}
        </div>
      )}
    </div>
  );
}

export default SessionFormPage;