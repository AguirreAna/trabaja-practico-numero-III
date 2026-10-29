import { body, param } from "express-validator";
import { Types } from "mongoose";
import { CategoryModel } from "../models/category.model.js";
import { EventModel } from "../models/event.model.js";
import { applyValidations } from "./validator.js";

const validateCategoriesExist = async (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return true;
  }

  for (const catId of categories) {
    if (!Types.ObjectId.isValid(catId)) {
      throw new Error(`El ID de categoría '${catId}' no es un ObjectId válido`);
    }
  }

  const uniqueIds = [...new Set(categories.map((id) => id.toString()))];
  const foundCategories = await CategoryModel.find({
    _id: { $in: uniqueIds },
  });

  if (foundCategories.length !== uniqueIds.length) {
    throw new Error("Una o más categorías enviadas no existen en la base de datos");
  }

  return true;
};

export const eventIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID del evento no es un ObjectId válido"),
  applyValidations,
];

export const createEventValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título del evento es obligatorio")
    .isLength({ min: 3, max: 150 })
    .withMessage("El título debe tener entre 3 y 150 caracteres")
    .custom(async (value) => {
      const existingEvent = await EventModel.findOne({ title: value });
      if (existingEvent) {
        throw new Error("Ya existe un evento con ese título");
      }
      return true;
    }),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción del evento es obligatoria")
    .isLength({ min: 20 })
    .withMessage("La descripción debe tener al menos 20 caracteres"),

  body("startDate")
    .notEmpty()
    .withMessage("La fecha de inicio (startDate) es obligatoria")
    .isISO8601()
    .withMessage("La fecha de inicio debe ser una fecha válida"),

  body("endDate")
    .notEmpty()
    .withMessage("La fecha de finalización (endDate) es obligatoria")
    .isISO8601()
    .withMessage("La fecha de finalización debe ser una fecha válida")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("endDate debe ser posterior a startDate");
      }
      return true;
    }),

  body("capacity")
    .notEmpty()
    .withMessage("La capacidad (capacity) es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un número entero mayor o igual a 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0")
    .toFloat(),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado solo puede ser 'scheduled', 'cancelled' o 'finished'"),

  body("location")
    .notEmpty()
    .withMessage("El objeto location es obligatorio")
    .isObject()
    .withMessage("El campo location debe ser un objeto"),

  body("location.venue")
    .trim()
    .notEmpty()
    .withMessage("El lugar (location.venue) es obligatorio")
    .isLength({ min: 3, max: 100 })
    .withMessage("El venue debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .trim()
    .notEmpty()
    .withMessage("La dirección (location.address) es obligatoria")
    .isLength({ min: 5, max: 150 })
    .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .trim()
    .notEmpty()
    .withMessage("La ciudad (location.city) es obligatoria")
    .isLength({ min: 2, max: 50 })
    .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray()
    .withMessage("El campo categories debe ser un array de ObjectIds"),

  body("categories.*")
    .optional()
    .isMongoId()
    .withMessage("Cada categoría debe ser un ObjectId válido"),

  body("categories").optional().custom(validateCategoriesExist),

  applyValidations,
];

export const updateEventValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID del evento no es un ObjectId válido"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El título no puede estar vacío")
    .isLength({ min: 3, max: 150 })
    .withMessage("El título debe tener entre 3 y 150 caracteres")
    .custom(async (value, { req }) => {
      const existingEvent = await EventModel.findOne({
        title: value,
        _id: { $ne: req.params.id },
      });
      if (existingEvent) {
        throw new Error("Ya existe otro evento con ese título");
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage("La descripción debe tener al menos 20 caracteres"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de inicio debe ser una fecha válida"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de finalización debe ser una fecha válida")
    .custom(async (value, { req }) => {
      const start = req.body.startDate
        ? new Date(req.body.startDate)
        : req.event?.startDate;
      if (start && new Date(value) <= new Date(start)) {
        throw new Error("endDate debe ser posterior a startDate");
      }
      return true;
    }),

  body("startDate").custom(async (value, { req }) => {
    if (!value) return true;
    const end = req.body.endDate
      ? new Date(req.body.endDate)
      : req.event?.endDate;
    if (end && new Date(end) <= new Date(value)) {
      throw new Error("endDate debe ser posterior a startDate");
    }
    return true;
  }),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La capacidad debe ser un número entero mayor o igual a 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El precio debe ser un número mayor o igual a 0")
    .toFloat(),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado solo puede ser 'scheduled', 'cancelled' o 'finished'"),

  body("location")
    .optional()
    .isObject()
    .withMessage("El campo location debe ser un objeto"),

  body("location.venue")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El venue debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray()
    .withMessage("El campo categories debe ser un array de ObjectIds"),

  body("categories.*")
    .optional()
    .isMongoId()
    .withMessage("Cada categoría debe ser un ObjectId válido"),

  body("categories").optional().custom(validateCategoriesExist),

  applyValidations,
];
