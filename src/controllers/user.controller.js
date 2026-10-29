import { matchedData } from "express-validator";
import { hashPassword } from "../helpers/bcrypt.helper.js";
import { EventModel } from "../models/event.model.js";
import { UserModel } from "../models/user.model.js";

export const getAllUsers = async (_req, res) => {
  try {
    const users = await UserModel.find({ deletedAt: null })
      .select("-password")
      .populate("events");

    return res.status(200).json({
      msg: "Usuarios activos obtenidos correctamente",
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const user = await UserModel.findOne({
      _id: id,
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
      msg: "Usuario obtenido correctamente",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const validatedData = matchedData(req);
    const { id, profile, password, ...restData } = validatedData;

    const existingUser = await UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingUser) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    Object.assign(existingUser, restData);

    if (password) {
      existingUser.password = await hashPassword(password);
    }

    if (profile) {
      if (profile.firstName !== undefined) {
        existingUser.profile.firstName = profile.firstName;
      }
      if (profile.lastName !== undefined) {
        existingUser.profile.lastName = profile.lastName;
      }
      if (profile.birthDate !== undefined) {
        existingUser.profile.birthDate = profile.birthDate;
      }
      if (profile.phone !== undefined) {
        existingUser.profile.phone = profile.phone;
      }
    }

    await existingUser.save();

    return res.status(200).json({
      msg: "Usuario actualizado correctamente",
      data: existingUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const existingUser = await UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingUser) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    existingUser.deletedAt = new Date();
    await existingUser.save();

    // Eliminación en cascada de todos los eventos organizados por el usuario
    await EventModel.deleteMany({ organizer: id });

    return res.status(200).json({
      msg: "Usuario eliminado lógicamente y sus eventos eliminados en cascada correctamente",
      data: existingUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
