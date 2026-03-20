import admin from "../config/firebase";
import { Request, Response, NextFunction } from "express";
import { UserService } from "../modules/user/user.services";

const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const decoded = await admin.auth().verifyIdToken(token);

 const user = await UserService.createUserIfNotExists(decoded);
(req as any).user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default verifyFirebaseToken;