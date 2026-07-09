# Sistema de Gestión de una Cochera

Trabajo Práctico Final - Aplicaciones Interactivas

Aplicación fullstack para gestionar el ingreso, egreso y facturación de vehículos en una cochera: espacios de estacionamiento, vehículos, tarifas por tipo de vehículo, abonos mensuales y sesiones (visitas) ocasionales o de abonados.

## Estructura del repositorio

/backend    # API REST (Node.js, Express, TypeORM, PostgreSQL)
/frontend   # Interfaz web (React, Vite, React Router)
Cada carpeta tiene su propio `README.md` con instrucciones detalladas de instalación y ejecución, y su propio `PREGUNTAS.md` con las respuestas de defensa técnica.

## Ejecución rápida

### 1. Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` en `backend` (ver `backend/README.md` para el detalle de variables necesarias), con los datos de conexión a una base PostgreSQL ya creada.

```bash
npm run migration:run
npm run seed
npm run dev
```

El backend queda disponible en `http://localhost:3000`.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

> El frontend necesita que el backend esté corriendo para funcionar correctamente.

## Tecnologías principales

- **Backend**: Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Frontend**: React, Vite, React Router, Axios

## Funcionalidades principales

- Gestión de espacios de estacionamiento (alta, listado, estado)
- Gestión de vehículos (alta, listado, bloqueo/activación)
- Configuración de tarifas por hora y mensuales, según tipo de vehículo
- Check-in de portón: asignación automática de espacio para vehículos ocasionales, o registro sin costo para vehículos con abono vigente
- Alta y corte anticipado de abonos mensuales
- Checkout con cálculo automático del monto a cobrar
- Registro completo de ingresos y egresos (sesiones)
- Reporte de ocupación general de la cochera