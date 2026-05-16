import { Prisma } from "@prisma/client";
import { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { apiResponse } from "../utils/apiResponse";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ApiError) {
    return apiResponse.error(res, error.message, error.statusCode, error.details, req.id);
  }

  if (error instanceof ZodError) {
    return apiResponse.error(res, "Validation failed", 400, error.flatten().fieldErrors, req.id);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return apiResponse.error(res, "A record with this value already exists", 409, error.meta, req.id);
    }

    if (error.code === "P2025") {
      return apiResponse.error(res, "Record not found", 404, undefined, req.id);
    }
  }

  const details = env.NODE_ENV === "production" ? undefined : { message: error.message, stack: error.stack };
  return apiResponse.error(res, "Internal server error", 500, details, req.id);
};
