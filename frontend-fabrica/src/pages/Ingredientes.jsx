import { useState } from "react";
import useCrud from "../hooks/useCrud";
import ErrorAlert from "../components/ErrorAlert";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const FORM_VACIO = { nombre: "", costo: "", unidad_medida_id: "" };

export default function Ingredientes() {
  const { items: ingredientes, loading, error, setError, crear, actualizar, eliminar } =
    useCrud("/ingredientes/");

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = {
      nombre: form.nombre.trim(),
      costo: Number(form.costo),
      unidad_medida_id: Number(form.unidad_medida_id),
    };
    const res = editando ? await actualizar(editando.id, payload) : await crear(payload);
    setGuardando(false);
    if (res.ok) {
      setForm(FORM_VACIO);
      setEditando(null);
    }
  };

  const editar = (ing) => {
    setEditando(ing);
    setForm({
      nombre: ing.nombre ?? "",
      costo: ing.costo ?? "",
      unidad_medida_id: ing.unidad_medida_id ?? ing.unidad_medida?.id ?? "",
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleEliminar = async (ing) => {
    if (!window.confirm(`¿Eliminar el ingrediente "${ing.nombre}"?`)) return;
    await eliminar(ing.id);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="page-eyebrow">Ingredientes</p>
        <h1 className="page-title">Insumos de producción</h1>
        <p className="page-subtitle">Costo unitario de cada ingrediente, usado para calcular el precio de los productos.</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="card mb-4">
        <div className="card-header">
          {editando ? `Editando "${editando.nombre}"` : "Nuevo ingrediente"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
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
                <label className="form-label">Costo *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="costo"
                    className="form-control"
                    value={form.costo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">ID Unidad de medida *</label>
                <input
                  type="number"
                  name="unidad_medida_id"
                  className="form-control"
                  value={form.unidad_medida_id}
                  onChange={handleChange}
                  required
                />
                <div className="form-text">
                  El id de la unidad ya cargada en la base (kg, litro, unidad, etc).
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? "Guardando..." : editando ? "Actualizar ingrediente" : "Crear ingrediente"}
              </button>
              {editando && (
                <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">{ingredientes.length} ingrediente(s) registrados</div>
        {loading ? (
          <Loading />
        ) : ingredientes.length === 0 ? (
          <EmptyState icon="🌾" title="Todavía no hay ingredientes" subtitle="Cargá el primero con el formulario de arriba." />
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Costo</th>
                  <th>Unidad de medida</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ing) => (
                  <tr key={ing.id}>
                    <td className="fw-medium">{ing.nombre}</td>
                    <td className="precio-tag">${Number(ing.costo).toFixed(2)}</td>
                    <td>{ing.unidad_medida?.nombre ?? `#${ing.unidad_medida_id}`}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editar(ing)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(ing)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
