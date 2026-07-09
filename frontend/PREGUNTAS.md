# Preguntas de defensa - Frontend

## Componentes

### 1. ¿Qué componentes reutilizables se identificaron y por qué?

Se identificaron 3: `Table`, `ErrorMessage` y `Navbar`. `Table` se reutiliza en `SpotsPage`, `VehiclesPage`, `SubscriptionsPage` y `SessionsPage`: todas necesitan mostrar filas de datos con columnas configurables y, opcionalmente, una acción por fila (un botón de estado, egreso, etc.). En vez de escribir el `<table>` HTML 4 veces, `Table` recibe `columns` (con una función `render` opcional por columna, para casos como mostrar un badge en vez del valor crudo) y `data`, y arma la tabla genéricamente. `ErrorMessage` se usa en los 5 formularios de la app para mostrar errores de la API de forma visualmente consistente.

### 2. ¿Por qué `RatesPage` no usa el componente `Table` reutilizable, a diferencia de las demás páginas de listado?

Porque `RatesPage` tiene una necesidad genuinamente distinta: cada fila puede entrar en un modo de "edición inline", donde dos celdas cambian de texto plano a `<input>` editables. El componente `Table` genérico no contempla ese caso (edición condicional por fila), y forzarlo hubiera significado agregarle una complejidad especial solo para esta página. Se prefirió escribir la tabla de forma específica ahí, en vez de forzar una reutilización que no aportaba valor real.

## Estado

### 3. ¿Cómo se maneja el estado de carga y error en las páginas?

Cada página que consume la API mantiene 3 piezas de estado con `useState`: los datos (`espacios`, `vehiculos`, etc.), un flag `cargando` (para mostrar "Cargando..." mientras se resuelve la petición inicial) y un `error` (para mostrar el mensaje si algo falla). Por ejemplo, en `SpotsPage`:
```jsx
const [espacios, setEspacios] = useState([]);
const [error, setError] = useState("");
const [cargando, setCargando] = useState(true);
```

### 4. ¿Por qué se recarga toda la lista después de cada operación (crear, actualizar), en vez de actualizar el estado local directamente?

Por simplicidad y para garantizar consistencia con el backend: después de un `POST` o `PATCH` exitoso, se vuelve a llamar a la función de carga (`cargarEspacios()`, `cargarDatos()`, etc.) en vez de mutar el array en memoria. Esto evita que el estado del frontend se desincronice de la base de datos real (por ejemplo, si el backend calculó algo distinto a lo que el frontend esperaba, como el `spotId` asignado automáticamente en un check-in). El costo es una petición HTTP extra por operación, que se consideró aceptable dado el tamaño del proyecto.

## Formularios

### 5. ¿Cómo se manejan los formularios? ¿Se usó alguna librería?

No se usó ninguna librería de formularios (como Formik o React Hook Form): cada campo del formulario tiene su propio `useState`, y el envío se maneja con un `onSubmit` que llama a la función del service correspondiente. Por ejemplo, en `VehiclesPage`:
```jsx
const [licensePlate, setLicensePlate] = useState("");
const [ownerName, setOwnerName] = useState("");
const [type, setType] = useState("CAR");
```
Se optó por esta forma manual porque los formularios del proyecto son simples (pocos campos, sin validaciones complejas de formato más allá de "obligatorio"), y agregar una librería externa hubiera sido una complejidad innecesaria para el alcance del trabajo.

### 6. ¿Cómo se validan los datos antes de enviarlos a la API?

Se hace una validación mínima en el cliente antes de enviar (por ejemplo, que los campos obligatorios no estén vacíos), para dar feedback inmediato sin depender de una ida y vuelta al servidor. Pero la validación real y completa vive en el backend (en los `services`), que es la única fuente de verdad — el frontend solo evita peticiones obviamente inválidas, nunca reemplaza la validación del servidor.

## Comunicación con la API

### 7. ¿Cómo está organizada la comunicación con el backend?

En la carpeta `src/services/`, con un archivo por recurso (`espacioService.js`, `vehiculoService.js`, etc.), cada uno exportando funciones que envuelven una llamada de `axios` a un endpoint específico. Todos comparten una instancia base de `axios` configurada en `services/api.js`, con la URL base del backend. Esto evita repetir la URL completa en cada llamada y centraliza la configuración (por ejemplo, si en el futuro hay que agregar un header de autenticación, se agrega en un solo lugar).

### 8. ¿Cómo se manejan los errores que devuelve la API?

Cada función que llama a un service está envuelta en un `try/catch`. En el `catch`, se lee `err.response?.data?.message` (el mensaje que arma el backend en sus respuestas de error) y se guarda en el estado `error` de la página, para mostrarlo con el componente `ErrorMessage`. El uso de `?.` (optional chaining) evita que la aplicación se rompa si la respuesta no tiene el formato esperado (por ejemplo, si el error es de red y no llegó a responder el servidor).

## Ruteo

### 9. ¿Cómo está armado el ruteo de la aplicación?

Con `react-router-dom`, usando `BrowserRouter`, `Routes` y `Route` en `App.jsx`. Cada ruta mapea una URL a un componente de página. El `Navbar` usa `NavLink` en vez de `Link`, porque `NavLink` permite aplicar una clase CSS distinta (`active`) cuando la ruta coincide con la actual, lo que se usa para resaltar visualmente en qué sección está parado el usuario.

### 10. ¿Por qué se muestra el `number` de un espacio en vez de su `id` en la interfaz?

Porque son dos cosas distintas: `id` es la clave primaria interna de la base de datos (autogenerada, sin significado para el usuario), mientras que `number` es el número real del espacio físico, que es lo que un empleado de la cochera reconoce y necesita ver. Varias páginas (`Sesiones`, `Abonos`, `Ingreso`) reciben del backend el `spotId` (el id interno) y hacen un cruce en el cliente contra la lista de espacios para mostrar el `number` correspondiente, en vez de mostrar el id crudo.