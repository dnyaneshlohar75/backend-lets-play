import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

export const authenticateUser = (request: Request, response: Response, next: NextFunction): void => {
  const token = request.headers.authorization?.split(" ")[1];

  if (!token) {
    response.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    response.status(403).json({ message: "Forbidden: Invalid token" });
    return;
  }

  (request as any).user = decoded;
  next();
};
