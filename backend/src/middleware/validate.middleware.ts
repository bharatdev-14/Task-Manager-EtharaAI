import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    if (parsed.params !== undefined) {
      req.params = parsed.params;
    }

    if (parsed.query !== undefined) {
      req.query = parsed.query;
    }
    next();
  };
