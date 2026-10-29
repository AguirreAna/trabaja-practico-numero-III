# Trabajo Práctico Integrador N° III

API REST desarrollada con **Node.js**, **Express**, **MongoDB** y **Mongoose** para la gestión de usuarios, eventos y categorías.

## Tecnologías utilizadas

- **Node.js & Express** (ESModules)
- **MongoDB & Mongoose** (ODM, relaciones 1:1 embebidas, 1:N y N:M referenciadas, virtual populate)
- **JSON Web Tokens (JWT)** & **cookie-parser** (`httpOnly` cookies)
- **bcrypt** (hasheo de contraseñas)
- **express-validator** (`validationResult` y `matchedData`)
- **dotenv** & **cors**

## Estructura del proyecto

```
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   ├── event.controller.js
│   │   └── user.controller.js
│   ├── helpers/
│   │   ├── bcrypt.helper.js
│   │   └── jwt.helper.js
│   ├── middlewares/
│   │   ├── admin.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── auth.validations.js
│   │   ├── category.validations.js
│   │   ├── event.validations.js
│   │   ├── owner.middleware.js
│   │   ├── user.validations.js
│   │   └── validator.js
│   ├── models/
│   │   ├── category.model.js
│   │   ├── event.model.js
│   │   └── user.model.js
│   └── routes/
│       ├── auth.routes.js
│       ├── category.routes.js
│       ├── event.routes.js
│       └── user.routes.js
├── .env.example
├── .gitignore
├── app.js
└── package.json
```

## Configuración e instalación

1. Clonar el repositorio e instalar las dependencias:
   ```bash
   npm install
   ```
2. Crear un archivo `.env` en la raíz basado en `.env.example`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/tp-integrador-3
   JWT_SECRET=tu_secreto_jwt_super_seguro
   JWT_EXPIRES_IN=1h
   PORT=3000
   ```
3. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints principales

### Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registro de usuario con perfil embebido (público)
- `POST /api/auth/login` - Login con JWT en cookie `httpOnly` (público)
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado
- `PUT /api/auth/profile` - Actualizar perfil embebido del usuario autenticado
- `POST /api/auth/logout` - Cerrar sesión limpiando la cookie

### Usuarios (`/api/users`)
- `GET /api/users` - Listar usuarios activos con virtual populate `events` (solo admin)
- `GET /api/users/:id` - Obtener usuario activo por ID con sus eventos (solo admin)
- `PUT /api/users/:id` - Actualizar usuario (solo admin)
- `DELETE /api/users/:id` - Eliminación lógica (`deletedAt`) y eliminación en cascada de sus eventos (solo admin)

### Eventos (`/api/events`)
- `POST /api/events` - Crear evento con categorías (usuario autenticado)
- `GET /api/events` - Listar eventos con populate de `organizer` y `categories` (usuario autenticado)
- `GET /api/events/my` - Listar eventos organizados por el usuario autenticado
- `GET /api/events/:id` - Obtener evento por ID (usuario autenticado)
- `PUT /api/events/:id` - Actualizar evento y sus categorías (solo organizador o admin)
- `DELETE /api/events/:id` - Eliminación física de un evento (solo organizador o admin)

### Categorías (`/api/categories`)
- `POST /api/categories` - Crear categoría (solo admin)
- `GET /api/categories` - Listar categorías (usuario autenticado)
- `GET /api/categories/:id` - Obtener categoría con virtual populate `events` (usuario autenticado)
- `PUT /api/categories/:id` - Actualizar categoría (solo admin)
- `DELETE /api/categories/:id` - Eliminar categoría y quitarla en cascada de los eventos (solo admin)
