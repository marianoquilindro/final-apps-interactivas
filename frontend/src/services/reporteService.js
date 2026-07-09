import api from "./api";

export const getOcupacion = () => api.get("/reports/occupancy");