import { RequestHandler } from "express";

const auditableMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const auditLogger: RequestHandler = (req, res, next) => {
  if (!auditableMethods.has(req.method)) {
    return next();
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const event = {
      requestId: req.id,
      actorId: req.user?.id ?? null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? null,
      durationMs: Date.now() - startedAt,
      createdAt: new Date().toISOString()
    };

    console.info(JSON.stringify({ type: "audit", event }));
  });

  return next();
};
