import { Types } from "mongoose";
import { EventModel } from "../models/event.model.js";

export const ownerOrAdminMiddleware = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "El ID del evento no es un ObjectId válido",
      });
    }

    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        msg: "Acceso denegado: solo el organizador del evento o un administrador pueden realizar esta acción",
      });
    }

    req.event = event;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
