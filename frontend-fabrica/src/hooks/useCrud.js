import { useState, useCallback, useEffect, useRef } from "react";
import api from "../services/api";

/**
 * Hook genérico de CRUD para un recurso de la API.
 * resource: ej "/productos/" (con barra final, como exponen los routers)
 */
export default function useCrud(resource) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const montado = useRef(true);

  const listar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(resource);
      if (!montado.current) return;
      setItems(data);
      setError(null);
    } catch (err) {
      if (!montado.current) return;
      setError(extraerError(err));
    } finally {
      if (montado.current) setLoading(false);
    }
  }, [resource]);

  const crear = async (payload) => {
    try {
      await api.post(resource, payload);
      await listar();
      return { ok: true };
    } catch (err) {
      const msg = extraerError(err);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const actualizar = async (id, payload) => {
    try {
      await api.put(`${resource}${id}`, payload);
      await listar();
      return { ok: true };
    } catch (err) {
      const msg = extraerError(err);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`${resource}${id}`);
      await listar();
      return { ok: true };
    } catch (err) {
      const msg = extraerError(err);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  useEffect(() => {
    montado.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar (patrón estándar), con guard de desmontaje via `montado`
    listar();
    return () => {
      montado.current = false;
    };
  }, [listar]);

  return { items, loading, error, setError, listar, crear, actualizar, eliminar };
}

function extraerError(err) {
  if (err.response?.data?.detail) {
    const d = err.response.data.detail;
    return typeof d === "string" ? d : JSON.stringify(d);
  }
  if (err.request && !err.response) {
    return "No se pudo conectar con el servidor. ¿Está corriendo el backend en http://localhost:8000?";
  }
  return err.message || "Ocurrió un error inesperado";
}
