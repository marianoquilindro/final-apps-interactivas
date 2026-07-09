import api from "./api";

export const getVehiculos = () => api.get("/vehicles");
export const crearVehiculo = (data) => api.post("/vehicles", data);
export const actualizarVehiculo = (id, data) => api.patch(`/vehicles/${id}`, data);