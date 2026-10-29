import { body } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { applyValidations } from "./validator.js";

const normalizeProfileInput = (req, _res, next) => {
  if (
    req.body &&
    !req.body.profile &&
    (req.body.firstName !== undefined ||
      req.body.lastName !== undefined ||
      req.body.birthDate !== undefined ||
      req.body.phone !== undefined)
  ) {
    req.body.profile = {
      ...(req.body.firstName !== undefined && { firstName: req.body.firstName }),
      ...(req.body.lastName !== undefined && { lastName: req.body.lastName }),
      ...(req.body.birthDate !== undefined && { birthDate: req.body.birthDate }),
      ...(req.body.phone !== undefined && { phone: req.body.phone }),
    };
  }
  next();
};

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede contener caracteres alfanuméricos")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({ username: value });
      if (existingUser) {
        throw new Error("El username ya está en uso");
      }
      return true;
    }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("Debe proporcionar un email con formato válido")
    .normalizeEmail()
    .custom(async (value) => {
      const existingEmail = await UserModel.findOne({ email: value });
      if (existingEmail) {
        throw new Error("El email ya está registrado");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
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
    .notEmpty()
    .withMessage("El objeto profile es obligatorio")
    .isObject()
    .withMessage("El campo profile debe ser un objeto"),

  body("profile.firstName")
    .trim()
    .notEmpty()
    .withMessage("El nombre (firstName) es obligatorio")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El nombre solo puede contener letras"),

  body("profile.lastName")
    .trim()
    .notEmpty()
    .withMessage("El apellido (lastName) es obligatorio")
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

export const loginValidation = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Debe proporcionar un email con formato válido")
    .normalizeEmail(),

  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El username no puede estar vacío"),

  body().custom((_value, { req }) => {
    if (!req.body.email && !req.body.username) {
      throw new Error("Debe proporcionar email o username para iniciar sesión");
    }
    return true;
  }),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),

  applyValidations,
];

export const updateProfileValidation = [
  normalizeProfileInput,

  body("profile")
    .notEmpty()
    .withMessage("Debe enviar los datos del perfil a actualizar")
    .isObject()
    .withMessage("El perfil debe ser un objeto"),

  body("profile.firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
    .withMessage("El nombre solo puede contener letras"),

  body("profile.lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío")
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
