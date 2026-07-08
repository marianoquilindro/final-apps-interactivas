# Backend - Sistema de Gestión de Cochera

API REST para gestionar el ingreso, egreso y facturación de vehículos en una cochera.

## Tecnologías

- Node.js + Express
- TypeScript
- TypeORM
- PostgreSQL

## Requisitos previos

- Node.js v22 o superior
- PostgreSQL instalado y corriendo
- Una base de datos vacía creada (por ejemplo, llamada `cochera`)

## Instalación

1. Clonar el repositorio y entrar a la carpeta `backend`:
```bash
   cd backend
```

2. Instalar dependencias:
```bash
   npm install
```

3. Crear un archivo `.env` en la raíz de `backend` con el siguiente contenido (ajustar según tu configuración local):

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=cochera
PORT=3000

4. Ejecutar las migraciones para crear las tablas:
```bash
   npm run migration:run
```

5. Cargar los datos de prueba (seed):
```bash
   npm run seed
```

6. Levantar el servidor en modo desarrollo:
```bash
   npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor con recarga automática |
| `npm run migration:generate -- src/migrations/<Nombre>` | Genera una migración a partir de cambios en las entidades |
| `npm run migration:run` | Ejecuta las migraciones pendientes |
| `npm run migration:revert` | Revierte la última migración ejecutada |
| `npm run seed` | Carga datos de prueba (idempotente) |

## Estructura del proyecto
src/
entities/       # Modelos de datos (TypeORM)
repositories/    # Acceso a datos, extendiendo repositorios de TypeORM
services/        # Lógica de negocio y reglas de validación
controllers/     # Manejo de requests/responses HTTP
routes/          # Definición de rutas de la API
config/          # Configuración de conexión a la base de datos
migrations/       # Migraciones de base de datos
seed.ts          # Script de carga de datos de prueba
index.ts         # Punto de entrada de la aplicación

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/spots` | Listar espacios |
| POST | `/spots` | Crear espacio |
| PATCH | `/spots/:id` | Actualizar status de espacio |
| GET | `/vehicles` | Listar vehículos |
| POST | `/vehicles` | Crear vehículo |
| PATCH | `/vehicles/:id` | Actualizar status de vehículo |
| GET | `/rates` | Listar tarifas |
| PATCH | `/rates/:id` | Actualizar tarifa |
| GET | `/subscriptions` | Listar abonos |
| POST | `/subscriptions` | Crear abono |
| PATCH | `/subscriptions/:id` | Cortar abono anticipadamente |
| GET | `/sessions` | Listar sesiones |
| POST | `/sessions` | Check-in (ingreso de vehículo) |
| PATCH | `/sessions/:id` | Checkout (egreso de vehículo) |
| GET | `/reports/occupancy` | Reporte de ocupación |