import { Request, Response } from "express";
import { env } from "../config/env";
import { apiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { checkDatabaseConnection } from "../utils/database";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  await checkDatabaseConnection();

  return apiResponse.success(res, {
    service: "team-task-management-api",
    status: "healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
