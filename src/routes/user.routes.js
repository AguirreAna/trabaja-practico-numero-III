import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  updateUserValidation,
  userIdValidation,
} from "../middlewares/user.validations.js";

export const userRouter = Router();

// Listar los usuarios activos con el virtual populate events (solo admin)
userRouter.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// Obtener un usuario activo con sus eventos (solo admin)
userRouter.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  userIdValidation,
  getUserById,
);

// Actualizar un usuario (solo admin)
userRouter.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  updateUserValidation,
  updateUser,
);

// Eliminación lógica del usuario con eliminación en cascada de sus eventos (solo admin)
userRouter.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  userIdValidation,
  deleteUser,
);
