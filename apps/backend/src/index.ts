import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./core/errors.js";
import { healthRouter } from "./modules/health/routes.js";
import { authRouter } from "./modules/auth/routes.js";
import { appsRouter } from "./modules/apps/routes.js";
import { hostingsRouter } from "./modules/hostings/routes.js";
import { domainsRouter } from "./modules/domains/routes.js";
import { secretsRouter } from "./modules/secrets/routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/apps", appsRouter);
app.use("/api/hostings", hostingsRouter);
app.use("/api/domains", domainsRouter);
app.use("/api/secrets", secretsRouter);

// Error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 ${env.APP_NAME} rodando em http://localhost:${env.PORT}`);
});
