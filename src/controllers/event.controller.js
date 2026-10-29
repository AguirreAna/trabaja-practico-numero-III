import { matchedData } from "express-validator";
import { EventModel } from "../models/event.model.js";

export const createEvent = async (req, res) => {
  try {
    const validatedData = matchedData(req);

    const newEvent = await EventModel.create({
      ...validatedData,
      organizer: req.user._id,
    });

    const populatedEvent = await EventModel.findById(newEvent._id)
      .populate("organizer", "-password")
      .populate("categories");

    return res.status(201).json({
      msg: "Evento creado correctamente",
      data: populatedEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getAllEvents = async (_req, res) => {
  try {
    const events = await EventModel.find()
      .populate("organizer", "-password")
      .populate("categories");

    return res.status(200).json({
      msg: "Eventos obtenidos correctamente",
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ organizer: req.user._id })
      .populate("organizer", "-password")
      .populate("categories");

    return res.status(200).json({
      msg: "Eventos del usuario obtenidos correctamente",
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const event = await EventModel.findById(id)
      .populate("organizer", "-password")
      .populate("categories");

    if (!event) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    return res.status(200).json({
      msg: "Evento obtenido correctamente",
      data: event,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const validatedData = matchedData(req);
    const { id, location, ...restData } = validatedData;

    const existingEvent = await EventModel.findById(id);

    if (!existingEvent) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    Object.assign(existingEvent, restData);

    if (location) {
      if (location.venue !== undefined) {
        existingEvent.location.venue = location.venue;
      }
      if (location.address !== undefined) {
        existingEvent.location.address = location.address;
      }
      if (location.city !== undefined) {
        existingEvent.location.city = location.city;
      }
    }

    await existingEvent.save();

    const updatedEvent = await EventModel.findById(id)
      .populate("organizer", "-password")
      .populate("categories");

    return res.status(200).json({
      msg: "Evento actualizado correctamente",
      data: updatedEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const existingEvent = await EventModel.findById(id);

    if (!existingEvent) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    await EventModel.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "Evento eliminado correctamente",
      data: existingEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
