# Preguntas de defensa - Backend

## Arquitectura

### 1. ¿Por qué se eligió una arquitectura en capas (controllers, services, repositories)? ¿Qué responsabilidad tiene cada una?

Se separó el código en 3 capas para que cada una tenga una única responsabilidad:
- **Controllers** (`src/controllers`): reciben el `Request` y devuelven el `Response`. Solo se encargan de traducir HTTP a llamadas de negocio y de mapear errores a códigos de estado. No contienen lógica de negocio.
- **Services** (`src/services`): contienen toda la lógica de negocio y las validaciones (por ejemplo, `SesionService.checkIn` implementa las reglas 2 a 6 del enunciado). No conocen nada de HTTP.
- **Repositories** (`src/repositories`): extienden los repositorios de TypeORM (`AppDataSource.getRepository(Entidad).extend({...})`) agregando métodos de consulta específicos, como `findActiveByVehicle`. Son la única capa que sabe cómo se accede a la base de datos.

Esta separación permite, por ejemplo, cambiar cómo se valida una regla de negocio sin tocar nada de Express, o cambiar una consulta sin tocar la lógica de negocio.

### 2. ¿Por qué los services lanzan objetos `{ status, message }` en vez de mensajes de error simples?

Para que el controller pueda mapear directamente ese `status` al código HTTP de la respuesta, sin tener que duplicar en cada controller la lógica de "si la entidad no existe, devolver 404". Por ejemplo, en `EspacioController.crear`:
```typescript
catch (error: any) {
  res.status(error.status || 500).json({ message: error.message || "Error interno" });
}
```
Este mismo patrón se repite en todos los controllers, lo que evita código duplicado.

### 3. ¿Por qué `Espacio` no tiene un campo que indique si está "reservado por un abono"?

Porque esa información se puede derivar consultando si existe un `Abono` con `status: ACTIVE` para ese `spotId` (ver `AbonoRepository.findActiveBySpot`). Agregar un campo redundante en `Espacio` obligaría a mantener sincronizados dos lugares con la misma información (el campo y la existencia del abono), lo que es una fuente común de bugs. Se prefirió calcular el estado "reservado" dinámicamente en el momento que se necesita (check-in ocasional y alta de abono).

## Manejo de errores HTTP

### 4. ¿Qué códigos de estado HTTP se usan en la API y quon qué criterio?

- **200**: operación exitosa sobre un recurso existente (GET, PATCH exitosos).
- **201**: creación exitosa de un recurso (POST exitosos, por ejemplo `EspacioService.crear`).
- **404**: el recurso solicitado no existe (por ejemplo, `AbonoService.cortarAnticipado` cuando el `id` no corresponde a ningún abono).
- **409 (Conflict)**: la operación es válida en su forma pero entra en conflicto con el estado actual de los datos (por ejemplo, crear un espacio con un `number` que ya existe, o hacer checkout de una sesión ya `COMPLETED`).
- **422 (Unprocessable Entity)**: los datos enviados tienen el formato incorrecto o violan una regla de validación (por ejemplo, `hourlyRate` negativo, o un campo obligatorio faltante).
- **500**: error inesperado del servidor (por ejemplo, si no existe una tarifa configurada para un tipo de vehículo, algo que no debería pasar si el seed está bien cargado).

### 5. ¿Por qué se usa 409 y no 400 para casos como "el vehículo ya tiene una sesión activa"?

Porque 400 (Bad Request) implica que la petición en sí está mal formada, mientras que 409 (Conflict) indica que la petición está bien formada, pero no se puede procesar porque entra en conflicto con el estado actual del recurso. Un `vehicleId` válido que ya tiene una sesión activa es un conflicto de estado, no un error de formato.

## Validaciones

### 6. ¿En qué capa se realizan las validaciones de entrada, y por qué ahí?

En la capa de **services**, antes de ejecutar cualquier operación contra la base de datos. Por ejemplo, en `VehiculoService.crear` se valida que `licensePlate`, `ownerName` y `type` existan y tengan el tipo correcto antes de siquiera consultar si ya existe un vehículo con esa patente. Se eligió esta capa (y no el controller) porque las reglas de validación son parte de la lógica de negocio, no de la capa HTTP — así, si en el futuro se agrega otra forma de invocar esta lógica (por ejemplo, un script batch), las validaciones se mantienen.

### 7. Dar un ejemplo de validación de tipo de dato y de validación de regla de negocio, y explicar la diferencia.

- **Validación de tipo de dato**: en `TarifaService.actualizar`, se verifica que `hourlyRate` sea `typeof === "number"` y no sea `NaN` antes de aceptar el valor. Esto previene que el sistema falle o guarde datos corruptos por errores de formato en el request.
- **Validación de regla de negocio**: en `SesionService.checkIn`, se verifica que el vehículo no esté `BLOCKED` (regla 2 del enunciado). Esta no es una validación de formato — el dato en sí es válido (`status: "BLOCKED"` es un valor perfectamente aceptable para ese campo) pero la operación específica que se quiere hacer (check-in) no está permitida en ese estado.

## TypeORM y migraciones

### 8. ¿Por qué se usa `synchronize: false` y migraciones en vez de dejar que TypeORM sincronice automáticamente el esquema?

`synchronize: true` es cómodo para prototipos rápidos, pero en un proyecto real es peligroso: TypeORM podría borrar o alterar columnas/tablas automáticamente al detectar cambios en las entidades, sin ningún control ni posibilidad de revisar el cambio antes de aplicarlo. Las migraciones, en cambio, generan un archivo explícito con el SQL a ejecutar (`npm run migration:generate`), que se puede revisar antes de correrlo (`npm run migration:run`), y que queda versionado en el repositorio junto con el código — así cualquiera que clone el proyecto puede reconstruir el esquema exacto de la base de datos ejecutando las migraciones en orden.

### 9. ¿Cómo se relacionan las entidades entre sí? Dar un ejemplo con `Sesion`.

Se usan decoradores de TypeORM (`@ManyToOne`, `@OneToMany`) para declarar las relaciones. Por ejemplo, en `Sesion.ts`:
```typescript
@ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.sessions)
@JoinColumn({ name: "vehicleId" })
vehicle!: Vehiculo;

@Column()
vehicleId!: number;
```
Se declaró tanto la relación (`vehicle`, que permite acceder al objeto `Vehiculo` completo si se necesita) como la columna de foreign key explícita (`vehicleId`), usando `@JoinColumn` para conectarlas. Esto permite trabajar con el ID directamente en los services (más simple y performante cuando no se necesita el objeto completo) sin perder la posibilidad de navegar la relación cuando sí hace falta.

### 10. ¿Por qué `subscriptionId` en `Sesion` es `nullable`?

Porque una sesión ocasional (de un vehículo sin abono) no está asociada a ningún abono — según la regla 5 del dominio, "puede estar asociada a un abono, si el ingreso corresponde a un vehículo abonado". Se modeló como `@Column({ nullable: true })` junto con `@ManyToOne(..., { nullable: true })` para reflejar que esta relación es opcional, a diferencia de `vehicleId` y `spotId`, que son obligatorias en toda sesión.

### 11. ¿Cómo se garantiza que el script de seed sea idempotente?

Para las entidades con una columna única natural (`Tarifa.vehicleType`, `Espacio.number`, `Vehiculo.licensePlate`), el seed busca primero si ya existe un registro con ese valor único antes de crearlo (`findOneBy`). Para `Abono`, se busca si ya existe un abono `ACTIVE` para el vehículo abonado del seed. Para `Sesion`, al no tener una columna única natural que identifique "la sesión del seed", se optó por un chequeo más simple: si la tabla ya tiene alguna fila (`sesionRepo.count() > 0`), se omite la creación de las 4 sesiones de prueba. Esto garantiza que correr `npm run seed` múltiples veces no duplique datos.