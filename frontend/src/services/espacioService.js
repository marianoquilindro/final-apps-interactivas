import api from "./api";

export const getEspacios = () => api.get("/spots");
export const crearEspacio = (data) => api.post("/spots", data);
export const actualizarEspacio = (id, data) => api.patch(`/spots/${id}`, data);