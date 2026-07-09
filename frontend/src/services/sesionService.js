import api from "./api";

export const getSesiones = () => api.get("/sessions");
export const checkIn = (data) => api.post("/sessions", data);
export const checkout = (id) => api.patch(`/sessions/${id}`, {});