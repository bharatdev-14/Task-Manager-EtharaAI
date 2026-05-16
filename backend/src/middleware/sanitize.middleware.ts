import { RequestHandler } from "express";

const blockedKeys = new Set(["__proto__", "prototype", "constructor"]);

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/\0/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      if (!blockedKeys.has(key)) {
        sanitized[key] = sanitizeValue(nestedValue);
      }
    }

    return sanitized;
  }

  return value;
}

export const sanitizeRequest: RequestHandler = (req, _res, next) => {
  req.body = sanitizeValue(req.body) as typeof req.body;
  req.query = sanitizeValue(req.query) as typeof req.query;
  req.params = sanitizeValue(req.params) as typeof req.params;
  next();
};
