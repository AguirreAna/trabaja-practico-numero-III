import { verifyToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        msg: "No autenticado: token no proporcionado",
      });
    }

    const decoded = verifyToken(token);

    const user = await UserModel.findOne({
      _id: decoded.id,
      deletedAt: null,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        msg: "No autenticado: usuario no válido o inactivo",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      msg: "No autenticado: token inválido o expirado",
    });
  }
};
