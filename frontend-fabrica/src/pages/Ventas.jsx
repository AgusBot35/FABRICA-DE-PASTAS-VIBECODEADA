import { useState, useEffect } from "react";
import useCrud from "../hooks/useCrud";
import api from "../services/api";
import ErrorAlert from "../components/ErrorAlert";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

const hoy = () => new Date().toISOString().slice(0, 10);

const ITEM_VACIO = { producto_id: "", cantidad: "1" };

export default function Ventas() {
  const { items: ventas, loading, error, setError, crear, eliminar } = useCrud("/ventas/");

  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  const [fecha, setFecha] = useState(hoy());
  const [clienteId, setClienteId] = useState("");
  const [detalle, setDetalle] = useState([{ ...ITEM_VACIO }]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [resClientes, resProductos] = await Promise.all([
          api.get("/clientes/"),
          api.get("/productos/"),
        ]);
        setClientes(resClientes.data);
        setProductos(resProductos.data);
      } catch {
        setError("No se pudieron cargar clientes/productos para armar la venta.");
      } finally {
        setCargandoCatalogos(false);
      }
    })();
  }, [setError]);

  const productoPorId = (id) => productos.find((p) => p.id === Number(id));

  const agregarItem = () => setDetalle([...detalle, { ...ITEM_VACIO }]);

  const quitarItem = (idx) => setDetalle(detalle.filter((_, i) => i !== idx));

  const cambiarItem = (idx, campo, valor) => {
    const copia = [...detalle];
    copia[idx] = { ...copia[idx], [campo]: valor };
    setDetalle(copia);
  };

  const totalVenta = detalle.reduce((acc, item) => {
    const prod = productoPorId(item.producto_id);
    const cant = Number(item.cantidad) || 0;
    return acc + (prod ? prod.precio * cant : 0);
  }, 0);

  const resetForm = () => {
    setFecha(hoy());
    setClienteId("");
    setDetalle([{ ...ITEM_VACIO }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = detalle.filter((d) => d.producto_id && Number(d.cantidad) > 0);
    if (items.length === 0) {
      setError("Agregá al menos un producto con cantidad mayor a 0.");
      return;
    }
    setGuardando(true);
    const payload = {
      fecha,
      cliente_id: Number(clienteId),
      detalle: items.map((d) => ({
        producto_id: Number(d.producto_id),
        cantidad: Number(d.cantidad),
      })),
    };
    const res = await crear(payload);
    setGuardando(false);
    if (res.ok) resetForm();
  };

  const handleEliminar = async (venta) => {
    if (!window.confirm(`¿Eliminar la venta #${venta.id}?`)) return;
    await eliminar(venta.id);
  };

  const nombreCliente = (id) => clientes.find((c) => c.id === id)?.nombre ?? `Cliente #${id}`;

  return (
    <div>
      <div className="mb-4">
        <p className="page-eyebrow">Ventas</p>
        <h1 className="page-title">Registro de ventas</h1>
        <p className="page-subtitle">Cargá una venta asociando cliente, fecha y los productos vendidos.</p>
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      <div className="card mb-4">
        <div className="card-header">Nueva venta</div>
        <div className="card-body">
          {cargandoCatalogos ? (
            <Loading />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Cliente *</label>
                  <select
                    className="form-select"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    required
                  >
                    <option value="">Seleccioná un cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  {clientes.length === 0 && (
                    <div className="form-text text-danger">
                      No hay clientes cargados. Creá uno primero en la sección Clientes.
                    </div>
                  )}
                </div>
              </div>

              <label className="form-label d-block">Detalle de productos *</label>
              {detalle.map((item, idx) => {
                const prod = productoPorId(item.producto_id);
                return (
                  <div className="row g-2 mb-2 align-items-center" key={idx}>
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={item.producto_id}
                        onChange={(e) => cambiarItem(idx, "producto_id", e.target.value)}
                        required
                      >
                        <option value="">Seleccioná un producto...</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (${Number(p.precio).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control"
                        placeholder="Cantidad"
                        value={item.cantidad}
                        onChange={(e) => cambiarItem(idx, "cantidad", e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2 small text-body-secondary">
                      {prod ? `Subtotal: $${(prod.precio * (Number(item.cantidad) || 0)).toFixed(2)}` : ""}
                    </div>
                    <div className="col-md-1">
                      {detalle.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => quitarItem(idx)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                className="btn btn-sm btn-outline-primary mt-1"
                onClick={agregarItem}
              >
                + Agregar producto
              </button>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <div>
                  <span className="text-body-secondary small d-block">Total estimado</span>
                  <span className="precio-tag fs-4">${totalVenta.toFixed(2)}</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={guardando || productos.length === 0}>
                  {guardando ? "Guardando..." : "Registrar venta"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">{ventas.length} venta(s) registradas</div>
        {loading ? (
          <Loading />
        ) : ventas.length === 0 ? (
          <EmptyState icon="🧾" title="Todavía no hay ventas" subtitle="Registrá la primera con el formulario de arriba." />
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.fecha}</td>
                    <td className="fw-medium">{nombreCliente(v.cliente_id)}</td>
                    <td className="small">
                      {v.detalle?.length
                        ? `${v.detalle.length} ítem(s)`
                        : "sin detalle"}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(v)}
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
