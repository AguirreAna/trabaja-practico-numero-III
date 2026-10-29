import { matchedData } from "express-validator";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const validatedData = matchedData(req);

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await UserModel.create({
      ...validatedData,
      password: hashedPassword,
    });

    return res.status(201).json({
      msg: "Usuario registrado correctamente",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = matchedData(req);

    const query = email
      ? { email, deletedAt: null }
      : { username, deletedAt: null };

    const user = await UserModel.findOne(query);

    if (!user) {
      return res.status(401).json({
        msg: "Credenciales inválidas",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        msg: "Credenciales inválidas",
      });
    }

    const token = generateToken({
      id: user._id,
      username: user.username,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({
      msg: "Inicio de sesión exitoso",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      _id: req.user._id,
      deletedAt: null,
    })
      .select("-password")
      .populate("events");

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Perfil obtenido correctamente",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profile } = matchedData(req);

    const user = await UserModel.findOne({
      _id: req.user._id,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    if (profile.firstName !== undefined) {
      user.profile.firstName = profile.firstName;
    }
    if (profile.lastName !== undefined) {
      user.profile.lastName = profile.lastName;
    }
    if (profile.birthDate !== undefined) {
      user.profile.birthDate = profile.birthDate;
    }
    if (profile.phone !== undefined) {
      user.profile.phone = profile.phone;
    }

    await user.save();

    return res.status(200).json({
      msg: "Perfil actualizado correctamente",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const logout = async (_req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      msg: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
