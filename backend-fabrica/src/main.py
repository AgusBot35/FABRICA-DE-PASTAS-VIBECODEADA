from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routers import productos, clientes, ventas, ingredientes

app = FastAPI(
    title="Fábrica de Pastas API",
    description="Sistema de gestión para fábrica de pastas artesanales",
    version="1.0.0",
)

# ─── API ──────────────────────────────────────────────────────────────────
# Todos los routers quedan bajo /api para no chocar con las rutas de React
# (ej: React tiene /productos para la pantalla, y la API también tenía
# /productos para el recurso — con el prefijo se distinguen sin ambigüedad).

app.include_router(productos.router, prefix="/api")
app.include_router(clientes.router, prefix="/api")
app.include_router(ventas.router, prefix="/api")
app.include_router(ingredientes.router, prefix="/api")


@app.get("/api", tags=["Health"])
def root():
    return {"status": "ok", "app": "Fábrica de Pastas"}


# ─── Frontend (build de React) ─────────────────────────────────────────────
# Sirve los archivos estáticos generados por `npm run build` (carpeta dist/).
# Como React Router maneja rutas del lado del cliente (/productos, /ventas,
# etc.), cualquier ruta que no sea /api ni un archivo estático real debe
# devolver siempre index.html para que React Router tome el control.

FRONTEND_DIST = Path(__file__).parent / "static"

if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )

    @app.get("/{full_path:path}", include_in_schema=False)
    def servir_frontend(full_path: str):
        archivo_pedido = (FRONTEND_DIST / full_path).resolve()
        # Evita servir archivos fuera de static/ (ej. ../../../etc/passwd)
        if FRONTEND_DIST.resolve() in archivo_pedido.parents and archivo_pedido.is_file():
            return FileResponse(archivo_pedido)
        return FileResponse(FRONTEND_DIST / "index.html")
