import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";

type JwtPayload = {
  id: string;
  email: string;
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication token is required"));
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true }
    });

    if (!user) {
      return next(new ApiError(401, "Invalid authentication token"));
    }

    req.user = user;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired authentication token"));
  }
};
