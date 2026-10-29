import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation,
} from "../middlewares/category.validations.js";

export const categoryRouter = Router();

// Crear una categoría (solo admin)
categoryRouter.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
  createCategoryValidation,
  createCategory,
);

// Listar las categorías (usuario autenticado)
categoryRouter.get("/categories", authMiddleware, getAllCategories);

// Obtener una categoría con el virtual populate events (usuario autenticado)
categoryRouter.get(
  "/categories/:id",
  authMiddleware,
  categoryIdValidation,
  getCategoryById,
);

// Actualizar una categoría (solo admin)
categoryRouter.put(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  updateCategoryValidation,
  updateCategory,
);

// Eliminar una categoría con eliminación en cascada (solo admin)
categoryRouter.delete(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  categoryIdValidation,
  deleteCategory,
);
