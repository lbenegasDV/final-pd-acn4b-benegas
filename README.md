# Final – Plataformas de Desarrollo  
**Aplicación:** Gestor de Reservas de Coworking  
**Alumno:** Benegas, Hector Leonardo  
**Comisión:** [ ACN4BV ] 
**Comisión:** [ Medina Sergio Daniel ] 

---

## 1. Descripción general

Aplicación **fullstack** para gestión de reservas de salas de coworking:

- **Backend:** API REST con Node.js + Express conectada a **base de datos real SQLite**.
- **Frontend:** SPA en React (Vite) que consume la API vía JSON.

Funcionalidades principales:

- Registro de usuarios y login con email + contraseña.
- Encriptación de contraseñas con **bcrypt**.
- Autenticación con **JWT**.
- Gestión de reservas:
  - Listado de reservas.
  - Detalle por id.
  - Creación con validaciones avanzadas.
  - Eliminación de reservas propias.
  - Actualización de reservas (si se utiliza el endpoint PUT).
- Catálogo de salas precargadas desde la base de datos.
- Rutas protegidas por autenticación en backend y frontend.
- Validaciones robustas en backend con **express-validator**.
- Manejo de errores centralizado.
- Diseño responsive tipo dashboard oscuro.
- UX mejorada en formulario de nueva reserva:
  - Fecha sin permitir días anteriores a hoy.
  - Hora validada según fecha seleccionada.
  - Calendario básico que marca días con reservas para la sala seleccionada.

---

## 2. Requisitos previos

- Node.js (LTS o superior)
- npm
- Git (para clonar y manejar el repositorio)

---

## 3. Estructura del proyecto

```text
raiz-del-repo/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    index.js
    database.sqlite
    package.json
    package-lock.json
  frontend/
    src/
      components/
      context/
      pages/
      services/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
  README.md
  INFORME.md 
  ```

---

## 4. Descripción general
### 4.1. Estructura de carpetas (backend)
```text
backend/
  index.js                 // Punto de entrada del servidor Express
  config/
    config.js              // Configuración de puerto, JWT, ruta DB
  controllers/
    authController.js      // Registro y login
    reservasController.js  // CRUD de reservas
    salasController.js     // Listado/detalle de salas
  routes/
    authRoutes.js
    reservasRoutes.js
    salasRoutes.js
  models/
    userModel.js
    reservaModel.js
    salaModel.js
  middleware/
    logger.js              // Log de requests
    authMiddleware.js      // Verificación JWT
    errorHandler.js        // Manejo centralizado de errores
  utils/
    db.js                  // Conexión SQLite
    initDb.js              // Creación de tablas + seed de salas
    validate.js            // Helper de express-validator
  database.sqlite          // Base de datos local
```
### 4.2. Instalación y ejecución

Desde la carpeta backend/:

```text
cd backend
npm install
npm run dev     # desarrollo con nodemon
# o
npm start       # modo normal
```
Servidor por defecto:

```text
http://localhost:4000
```
---

### 4.3. Endpoints principales
#### 4.3.1 Autenticación (/api/auth)

POST /api/auth/register
Registra un nuevo usuario.

Body:

```text
{
  "nombre": "Leonardo",
  "email": "leo@test.com",
  "password": "123456"
}
```
Respuesta (201):

```text
{
  "message": "Usuario registrado correctamente",
  "user": {
    "id": "user-id",
    "nombre": "Leonardo",
    "email": "leo@test.com",
    "createdAt": "2025-12-07T..."
  }
}
```
---
POST /api/auth/login

Valida credenciales y devuelve JWT.

Body:

```text
{
  "email": "leo@test.com",
  "password": "123456"
}
```
Respuesta (200):

```text
{
  "message": "Login exitoso",
  "token": "JWT_GENERADO",
  "user": {
    "id": "user-id",
    "nombre": "Leonardo",
    "email": "leo@test.com"
  }
}
```
---
#### 4.3.2 Salas (/api/salas)

GET /api/salas
Devuelve catálogo precargado desde SQLite.

Ejemplo:

```text
[
  {
    "id": "sala-azul",
    "nombre": "Sala Azul",
    "capacidad": 6,
    "ubicacion": "Piso 1 - Sector A"
  }
] 
```

GET /api/salas/:id
Devuelve detalle de una sala.

---

#### 4.3.3 Reservas (/api/reservas)

GET /api/reservas
Lista reservas.

GET /api/reservas/:id
Detalle por id (requisito mínimo del final).

POST /api/reservas
Crea una reserva (ruta protegida).

Headers:

```text
Authorization: Bearer JWT_GENERADO
Content-Type: application/json
```
Body recomendado (selección desde catálogo):

```text
{
  "fecha": "2025-12-10",
  "hora": "14:00",
  "salaId": "sala-azul",
  "notas": "Reunión de trabajo"
}
```

Body alternativo (ingreso manual):

```text
{
  "fecha": "2025-12-10",
  "hora": "14:00",
  "salaNombre": "Sala Especial",
  "notas": "Reunión de trabajo"
}
```

Respuesta (201):

```text
{
  "message": "Reserva creada correctamente",
  "reserva": {
    "id": "reserva-id",
    "usuarioId": "user-id",
    "salaId": "sala-azul",
    "salaNombre": "Sala Azul",
    "fecha": "2025-12-10",
    "hora": "14:00",
    "notas": "Reunión de trabajo",
    "createdAt": "2025-12-07T..."
  }
}
```

PUT /api/reservas/:id
Actualiza una reserva (solo dueño, ruta protegida).

DELETE /api/reservas/:id
Elimina una reserva (solo dueño, ruta protegida).

---

## 5. Frontend
### 5.1 Estructura de carpetas (frontend)

```text
frontend/
  src/
    main.jsx
    App.jsx
    styles.css
    context/
      AuthContext.jsx
    services/
      api.js
    components/
      Layout.jsx
      Navbar.jsx
      InputField.jsx
      DateField.jsx
      TimeField.jsx
      CalendarAvailability.jsx
      MessageBanner.jsx
      ReservaCard.jsx
      ReservaForm.jsx
      ProtectedRoute.jsx
    pages/
      LoginPage.jsx
      RegisterPage.jsx
      ReservasPage.jsx
      ReservaDetailPage.jsx
      NotFoundPage.jsx
```
### 5.2 Instalación y ejecución

Desde frontend/:

```text
cd frontend
npm install
npm run dev
```

Generalmente:

```text
http://localhost:5173
```
> Importante: el backend debe estar corriendo en http://localhost:4000.

## 5.3. Flujo de uso

### Registro (`/registro`)
- Envío de **POST `/api/auth/register`**.

### Login (`/login`)
- Envío de **POST `/api/auth/login`**.
- Guarda `token` y `user` en **localStorage** y **AuthContext**.
- Redirige a **`/reservas`**.

### Reservas (`/reservas`)
- Ruta protegida.
- Al cargar:
  - **GET `/api/salas`**
  - **GET `/api/reservas`**
- Formulario con validaciones avanzadas:
  - `fecha >= hoy`
  - hora válida según fecha
  - selección de sala desde catálogo o ingreso manual
  - calendario con días con reservas para la sala seleccionada
- Envío de **POST `/api/reservas`** con token.
- La lista se actualiza sin recargar la página.

### Detalle (`/reservas/:id`)
- Envío de **GET `/api/reservas/:id`**.
- Permite eliminar si el usuario es dueño de la reserva.

### Logout
- Limpia **AuthContext** y **localStorage**.

---

## 6. Diseño y estilos

- Estilo oscuro tipo dashboard.
- Layout centrado con ancho máximo.
- Cards, botones y inputs consistentes.
- Mensajes dinámicos de éxito/error.
- Responsive (2 columnas en desktop, 1 en mobile).
- UX mejorada en “Nueva reserva” con validaciones y calendario.

---

## 7. Tecnologías utilizadas

### Backend
- Node.js
- Express
- CORS
- SQLite (persistencia real)
- bcrypt
- jsonwebtoken (JWT)
- express-validator
- crypto.randomUUID()
- Middleware propio (logger, auth, validate, errorHandler)

### Frontend
- React + Vite
- React Router DOM
- Context API (auth)
- Fetch + async/await
- CSS custom (tema oscuro + responsive)

---

## 8 Instrucciones para correr el proyecto completo

1. **Clonar el repositorio**

   ```bash
   git clone <URL_DEL_REPO>
   cd <carpeta-del-repo>
   
2. **Instalar y levantar el backend**
 
    ```bash
    cd backend
    npm install
    npm run dev

Backend:
    ```text
    http://localhost:4000


3. **Instalar y levantar el frontend (en otra terminal)**
 
    ```bash
    cd frontend
    npm install
    npm run dev

Frontend:
    ```text
    http://localhost:5173

4. **Probar la aplicación**

 - Abrir el navegador en http://localhost:5173
 - Registrarse con un usuario nuevo.
 - Iniciar sesión.
 - Crear una reserva y verificar el listado y el detalle.
