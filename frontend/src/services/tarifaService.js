import api from "./api";

export const getTarifas = () => api.get("/rates");
export const actualizarTarifa = (id, data) => api.patch(`/rates/${id}`, data);