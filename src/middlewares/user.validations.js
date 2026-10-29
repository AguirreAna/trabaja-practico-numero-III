import { body, param } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { applyValidations } from "./validator.js";

export const userIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID de usuario no es un ObjectId válido"),
  applyValidations,
];

export const updateUserValidation = [
  param("id")
    .isMongoId()
    .withMessage("El ID de usuario no es un ObjectId válido"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede contener caracteres alfanuméricos")
    .custom(async (value, { req }) => {
      const existingUser = await UserModel.findOne({
        username: value,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        throw new Error("El username ya está en uso por otro usuario");
      }
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe proporcionar un email con formato válido")
    .normalizeEmail()
    .custom(async (value, { req }) => {
      const existingEmail = await UserModel.findOne({
        email: value,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        throw new Error("El email ya está registrado por otro usuario");
      }
      return true;
    }),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
    ),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("El rol solo puede ser 'user' o 'admin'"),

  body("profile")
    .optional()
    .isObject()
    .withMessage("El campo profile debe ser un objeto"),

  body("profile.firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El nombre solo puede contener letras"),

  body("profile.lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El apellido solo puede contener letras"),

  body("profile.birthDate")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("La fecha de nacimiento debe tener un formato válido")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    }),

  body("profile.phone")
    .optional({ values: "null" })
    .trim()
    .matches(/^\d{8,15}$/)
    .withMessage("El teléfono debe contener solo números (entre 8 y 15 dígitos)"),

  applyValidations,
];
