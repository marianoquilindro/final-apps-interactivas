# Frontend - Sistema de Gestión de Cochera

Interfaz web para gestionar espacios, vehículos, tarifas, abonos y sesiones de una cochera.

## Tecnologías

- React 19
- Vite
- React Router
- Axios

## Requisitos previos

- Node.js v22 o superior
- El backend corriendo en `http://localhost:3000` (ver `/backend/README.md`)

## Instalación

1. Entrar a la carpeta `frontend`:
```bash
   cd frontend
```

2. Instalar dependencias:
```bash
   npm install
```

3. Levantar el servidor de desarrollo:
```bash
   npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Estructura del proyecto
src/
components/     # Componentes reutilizables (Navbar, Table, ErrorMessage)
pages/          # Vistas de la aplicación, una por recurso
services/       # Funciones que consumen la API del backend (axios)
App.jsx         # Configuración de rutas (React Router)
index.css       # Sistema de diseño global (tokens, tipografía, componentes base)
main.jsx        # Punto de entrada de React

## Páginas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Espacios | Listado, alta y cambio de estado de espacios |
| `/vehicles` | Vehículos | Listado, alta y bloqueo/activación de vehículos |
| `/rates` | Tarifas | Listado y edición de tarifas por tipo de vehículo |
| `/subscriptions` | Abonos | Listado, alta y corte anticipado de abonos |
| `/check-in` | Ingreso | Formulario de check-in de portón |
| `/sessions` | Sesiones | Listado de sesiones con acción de egreso |
| `/occupancy` | Ocupación | Reporte general de ocupación de la cochera |

## Componentes reutilizables

- **`Table`**: tabla genérica que recibe columnas (con render personalizado opcional) y filas, reutilizada en Espacios, Vehículos, Abonos y Sesiones.
- **`ErrorMessage`**: mensaje de error consistente, usado en todos los formularios de la aplicación.
- **`Navbar`**: barra de navegación con indicador de ruta activa.