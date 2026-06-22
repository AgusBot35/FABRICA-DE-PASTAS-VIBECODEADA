import axios from "axios";

// Rutas relativas: en producción React se sirve desde el mismo FastAPI
// (mismo origen, así que no hace falta indicar host ni puerto).
// En desarrollo (npm run dev en :5173) usá el proxy de vite.config.js
// para que estas mismas rutas relativas lleguen al backend en :8000.
const api = axios.create({
  baseURL: "/api",
});

export default api;
