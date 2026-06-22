import { useState } from "react";
import useCrud from "../hooks/useCrud";
import ErrorAlert from "../components/ErrorAlert";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const FORM_VACIO = {
  nombre: "",
  numero_documento: "",
  direccion: "",
  celular: "",
  telefono: "",
  email: "",
};

export default function Clientes() {
  const { items: clientes, loading, error, setError, crear, actualizar, eliminar } =
    useCrud("/clientes/");

  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const normalizarPayload = () => ({
    nombre: form.nombre.trim(),
    numero_documento: form.numero_documento ? Number(form.numero_documento) : null,
    direccion: form.direccion.trim() || null,
    celular: form.celular ? Number(form.celular) : null,
    telefono: form.telefono ? Number(form.telefono) : null,
    email: form.email.trim() || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const payload = normalizarPayload();
    const res = editando
      ? await actualizar(editando.id, payload)
      : await crear(payload);
    setGuardando(false);
    if (res.ok) {
      setForm(FORM_VACIO);
      setEditando(null);
    }
  };

  const editar = (cliente) => {
    setEditando(cliente);
    setForm({
      nombre: cliente.nombre ?? "",
      numero_documento: cliente.numero_documento ?? "",
      direccion: cliente.direccion ?? "",
      celular: cliente.celular ?? "",
      telefono: cliente.telefono ?? "",
      email: cliente.email ?? "",
    });
  };

  const cancelar = () => {
    setEditando(null);
    setForm(FORM_VACIO);
  };

  const handleEliminar = async (cliente) => {
    if (!window.confirm(`¿Eliminar al cliente "${cliente.nombre}"?`)) return;
    await eliminar(cliente.id);
  };

  return (
    <div>
      <div className="mb-4">
        <p className="page-eyebrow">Clientes</p>
        <h1 className="page-title">Cartera de clientes</h1>
        <p className="page-subtitle">Alta, edición y baja de clientes de la fábrica.</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="card mb-4">
        <div className="card-header">
          {editando ? `Editando a ${editando.nombre}` : "Nuevo cliente"}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
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
                <label className="form-label">N° documento</label>
                <input
                  type="number"
                  name="numero_documento"
                  className="form-control"
                  value={form.numero_documento}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className="form-control"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Celular</label>
                <input
                  type="number"
                  name="celular"
                  className="form-control"
                  value={form.celular}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Teléfono fijo</label>
                <input
                  type="number"
                  name="telefono"
                  className="form-control"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? "Guardando..." : editando ? "Actualizar cliente" : "Crear cliente"}
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
        <div className="card-header">{clientes.length} cliente(s) registrados</div>
        {loading ? (
          <Loading />
        ) : clientes.length === 0 ? (
          <EmptyState icon="👥" title="Todavía no hay clientes" subtitle="Cargá el primero con el formulario de arriba." />
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Dirección</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-medium">{c.nombre}</td>
                    <td>{c.numero_documento ?? "—"}</td>
                    <td>
                      <div className="small">{c.email || "—"}</div>
                      <div className="small text-body-secondary">
                        {c.celular || c.telefono || ""}
                      </div>
                    </td>
                    <td>{c.direccion || "—"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editar(c)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(c)}
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
