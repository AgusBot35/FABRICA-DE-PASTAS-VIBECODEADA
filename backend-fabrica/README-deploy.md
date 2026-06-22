# Fábrica de Pastas — Backend + Frontend en un solo puerto

A partir de este cambio, **todo se sirve desde `http://localhost:8000`**.
Ya no hace falta levantar Vite por separado para usar la app normalmente.

## Cómo correrlo

```bash
docker compose up --build
```

Abrí `http://localhost:8000` en el navegador y ahí está la app completa
(Clientes, Productos, Ingredientes, Ventas).

La API sigue disponible, ahora bajo el prefijo `/api`:

- `http://localhost:8000/api/productos/`
- `http://localhost:8000/api/clientes/`
- `http://localhost:8000/api/ingredientes/`
- `http://localhost:8000/api/ventas/`
- Docs interactivas: `http://localhost:8000/docs`

## Qué cambió respecto a la versión anterior

1. **Los routers de FastAPI ahora cuelgan de `/api`**, no de la raíz.
   Antes: `GET /productos/`. Ahora: `GET /api/productos/`.
   Esto es necesario porque React Router también usa `/productos` como
   ruta de pantalla, y conviven en el mismo origen — el prefijo evita la
   ambigüedad.

2. **FastAPI sirve el build de React.** El contenido de `src/static/`
   (generado con `npm run build` en el frontend) se sirve como archivos
   estáticos. Cualquier ruta que no sea `/api/...` ni un archivo real
   devuelve `index.html`, para que React Router la resuelva del lado
   del cliente.

3. **CORS ya no es necesario** para el uso normal, porque todo vive en
   el mismo origen (`localhost:8000`). El middleware se sacó del
   `main.py`.

## Si querés volver a desarrollar el frontend con hot-reload

Para iterar sobre el frontend con recarga instantánea (sin tener que
rebuildear cada vez), corré Vite por separado:

```bash
cd frontend
npm install
npm run dev
```

Esto levanta React en `http://localhost:5173`. El `vite.config.js` ya
tiene un proxy configurado: cualquier llamada a `/api/...` se reenvía
automáticamente a `http://localhost:8000`, así que `axios` sigue
funcionando sin tocar nada — solo asegurate de que el backend
(`docker compose up`) esté corriendo en paralelo.

Cuando termines de iterar y quieras que los cambios queden reflejados
en `localhost:8000`, regenerá el build y copialo al backend:

```bash
cd frontend
npm run build
# copiá el contenido de frontend/dist/ a backend/src/static/
```

(En Linux/Mac: `rm -rf ../backend/src/static && cp -r dist ../backend/src/static`)
