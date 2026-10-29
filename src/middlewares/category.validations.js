import { body, param } from "express-validator";
import { CategoryModel } from "../models/category.model.js";
import { applyValidations } from "./validator.js";

export const categoryIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID de categoría no es un ObjectId válido"),
  applyValidations,
];

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la categoría es obligatorio")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre de la categoría debe tener entre 2 y 30 caracteres")
    .custom(async (value) => {
      const existingCategory = await CategoryModel.findOne({ name: value });
      if (existingCategory) {
        throw new Error("Ya existe una categoría con ese nombre");
      }
      return true;
    }),

  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),

  applyValidations,
];

export const updateCategoryValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID de categoría no es un ObjectId válido"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre de la categoría no puede estar vacío")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre de la categoría debe tener entre 2 y 30 caracteres")
    .custom(async (value, { req }) => {
      const existingCategory = await CategoryModel.findOne({
        name: value,
        _id: { $ne: req.params.id },
      });
      if (existingCategory) {
        throw new Error("Ya existe otra categoría con ese nombre");
      }
      return true;
    }),

  body("description")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede superar los 200 caracteres"),

  applyValidations,
];
