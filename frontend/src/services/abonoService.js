import api from "./api";

export const getAbonos = () => api.get("/subscriptions");
export const crearAbono = (data) => api.post("/subscriptions", data);
export const cortarAbono = (id) => api.patch(`/subscriptions/${id}`, {});