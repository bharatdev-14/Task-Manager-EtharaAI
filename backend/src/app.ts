import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env";
import { auditLogger } from "./middleware/audit.middleware";
import { authRouter } from "./routes/auth.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { healthRouter } from "./routes/health.routes";
import { projectRouter } from "./routes/project.routes";
import { taskRouter } from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { apiRateLimit } from "./middleware/rateLimit.middleware";
import { requestId } from "./middleware/requestId.middleware";
import { sanitizeRequest } from "./middleware/sanitize.middleware";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestId);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    referrerPolicy: { policy: "no-referrer" }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"]
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeRequest);
app.use("/api", apiRateLimit);
app.use(auditLogger);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", taskRouter);

app.use(notFoundHandler);
app.use(errorHandler);
