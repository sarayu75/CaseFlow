import express from "express";
import cors from "cors";
import casesRoutes from "./routes/cases.routes.js";
import aiRoutes from "./routes/ai.routes.js";

/**
 * Builds and configures the Express app WITHOUT starting it listening.
 * Separating this from index.js's app.listen() is what lets tests import
 * and exercise the app directly (e.g. via supertest) without needing a
 * real network port or a running server process.
 */
export function createApp() {
  const app = express();

  // Only these origins may call the API. Configurable via env var so the
  // same code works locally (Vite's default dev port) and once deployed
  // (the real frontend URL), without ever falling back to "*".
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests with no Origin header (curl, server-to-server, some
        // mobile clients) are allowed through -- CORS is a browser-only
        // protection anyway, this isn't a security boundary on its own.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
    })
  );
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("CaseFlow API running");
  });

  app.use("/cases", casesRoutes);
  app.use("/", aiRoutes);

  return app;
}