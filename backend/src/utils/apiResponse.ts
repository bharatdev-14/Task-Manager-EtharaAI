import { Response } from "express";

type Meta = Record<string, unknown>;

export const apiResponse = {
  success<T>(res: Response, data: T, message = "Success", statusCode = 200, meta?: Meta) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {})
    });
  },

  error(res: Response, message = "Something went wrong", statusCode = 500, details?: unknown, requestId?: string) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(requestId ? { requestId } : {}),
      ...(details ? { details } : {})
    });
  }
};
