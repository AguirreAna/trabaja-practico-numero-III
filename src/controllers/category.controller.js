import { matchedData } from "express-validator";
import { CategoryModel } from "../models/category.model.js";
import { EventModel } from "../models/event.model.js";

export const createCategory = async (req, res) => {
  try {
    const validatedData = matchedData(req);

    const newCategory = await CategoryModel.create(validatedData);

    return res.status(201).json({
      msg: "Categoría creada correctamente",
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getAllCategories = async (_req, res) => {
  try {
    const categories = await CategoryModel.find();

    return res.status(200).json({
      msg: "Categorías obtenidas correctamente",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const category = await CategoryModel.findById(id).populate("events");

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      msg: "Categoría obtenida correctamente",
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const validatedData = matchedData(req);
    const { id, ...updateData } = validatedData;

    const existingCategory = await CategoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after", runValidators: true },
    );

    return res.status(200).json({
      msg: "Categoría actualizada correctamente",
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = matchedData(req);

    const existingCategory = await CategoryModel.findById(id);

    if (!existingCategory) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    await CategoryModel.findByIdAndDelete(id);

    // Eliminación en cascada: quitar la categoría de todos los eventos que la referencian
    await EventModel.updateMany(
      { categories: id },
      { $pull: { categories: id } },
    );

    return res.status(200).json({
      msg: "Categoría eliminada y desvinculada de los eventos correctamente",
      data: existingCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
