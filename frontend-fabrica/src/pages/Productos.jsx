import { useState } from "react";
import useCrud from "../hooks/useCrud";
import ErrorAlert from "../components/ErrorAlert";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const FORM_VACIO = { nombre: "", ganancia: "", es_relleno: false, descuento: "0" };

export default function Productos() {
  const { items: productos, loading, error, setError, crear, actualizar, eliminar } =
    useCrud("/productos/");

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [expandido, setExpandido] = useState(null);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      nombre: form.nombre.trim(),
      ganancia: Number(form.ganancia),
      es_relleno: form.es_relleno,
      descuento: Number(form.descuento || 0),
    };
    const res = editando ? await actualizar(editando.id, payload) : await crear(payload);
    setGuardando(false);
    if (res.ok) {
      setForm(FORM_VACIO);
      setEditando(null);
    }
  };

  const editar = (p) => {
    setEditando(p);
    setForm({
      nombre: p.nombre ?? "",
      ganancia: p.ganancia ?? "",
      es_relleno: !!p.es_relleno,
      descuento: p.descuento ?? "0",
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleEliminar = async (p) => {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    await eliminar(p.id);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="page-eyebrow">Productos</p>
        <h1 className="page-title">Catálogo de productos</h1>
        <p className="page-subtitle">
          El precio se calcula automáticamente a partir del costo de los ingredientes de la receta y el coeficiente de ganancia.
        </p>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="card mb-4">
        <div className="card-header">
          {editando ? `Editando "${editando.nombre}"` : "Nuevo producto"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Coeficiente de ganancia *</label>
                <input
                  type="number"
                  step="0.01"
                  name="ganancia"
                  className="form-control"
                  value={form.ganancia}
                  onChange={handleChange}
                  placeholder="ej: 1.5"
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Descuento (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="descuento"
                  className="form-control"
                  value={form.descuento}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    name="es_relleno"
                    id="es_relleno"
                    className="form-check-input"
                    checked={form.es_relleno}
                    onChange={handleChange}
                  />
                  <label htmlFor="es_relleno" className="form-check-label">
                    Es relleno
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? "Guardando..." : editando ? "Actualizar producto" : "Crear producto"}
              </button>
              {editando && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </div>
            <p className="form-text mt-2 mb-0">
              La receta (ingredientes y cantidades) se asocia por separado; un producto recién creado
              tiene precio $0 hasta que tenga ingredientes cargados en su receta.
            </p>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">{productos.length} producto(s) en catálogo</div>
        {loading ? (
          <Loading />
        ) : productos.length === 0 ? (
          <EmptyState icon="🍝" title="Todavía no hay productos" subtitle="Cargá el primero con el formulario de arriba." />
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Ganancia</th>
                  <th>Descuento</th>
                  <th>Tipo</th>
                  <th>Receta</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <>
                    <tr key={p.id}>
                      <td className="fw-medium">{p.nombre}</td>
                      <td className="precio-tag">${Number(p.precio).toFixed(2)}</td>
                      <td>{p.ganancia}</td>
                      <td>{p.descuento}%</td>
                      <td>
                        {p.es_relleno && (
                          <span className="badge badge-relleno">Relleno</span>
                        )}
                      </td>
                      <td>
                        {p.recetas?.length ? (
                          <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => setExpandido(expandido === p.id ? null : p.id)}
                          >
                            {p.recetas.length} ingrediente(s) {expandido === p.id ? "▲" : "▼"}
                          </button>
                        ) : (
                          <span className="text-body-secondary small">sin receta</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => editar(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(p)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {expandido === p.id && p.recetas?.length > 0 && (
                      <tr>
                        <td colSpan={7} style={{ backgroundColor: "var(--semola)" }}>
                          <ul className="mb-0 small">
                            {p.recetas.map((r) => (
                              <li key={r.id}>
                                {r.cantidad} × {r.ingrediente?.nombre} (${r.ingrediente?.costo} c/u)
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
