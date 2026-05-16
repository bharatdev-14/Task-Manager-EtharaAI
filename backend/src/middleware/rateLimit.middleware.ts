import rateLimit from "express-rate-limit";
import { apiResponse } from "../utils/apiResponse";

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => apiResponse.error(res, "Too many requests", 429)
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => apiResponse.error(res, "Too many authentication attempts", 429)
});
