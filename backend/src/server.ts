import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import cors from "cors";
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const server = app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});


const shutdown = async () => {
  console.log("Shutting down API server");
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
