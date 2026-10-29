import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createEventValidation,
  eventIdValidation,
  updateEventValidation,
} from "../middlewares/event.validations.js";
import { ownerOrAdminMiddleware } from "../middlewares/owner.middleware.js";

export const eventRouter = Router();

// Crear un evento con sus categorías; el organizador es el usuario autenticado
eventRouter.post(
  "/events",
  authMiddleware,
  createEventValidation,
  createEvent,
);

// Listar los eventos con populate de organizer y categories (usuario autenticado)
eventRouter.get("/events", authMiddleware, getAllEvents);

// Listar los eventos del usuario logueado (usuario autenticado)
eventRouter.get("/events/my", authMiddleware, getMyEvents);

// Obtener un evento con populate de organizer y categories (usuario autenticado)
eventRouter.get(
  "/events/:id",
  authMiddleware,
  eventIdValidation,
  getEventById,
);

// Actualizar un evento y sus categorías (solo organizador o admin)
eventRouter.put(
  "/events/:id",
  authMiddleware,
  ownerOrAdminMiddleware,
  updateEventValidation,
  updateEvent,
);

// Eliminación física de un evento (solo organizador o admin)
eventRouter.delete(
  "/events/:id",
  authMiddleware,
  ownerOrAdminMiddleware,
  eventIdValidation,
  deleteEvent,
);
