import express from "express";
import cors from "cors";
import casesRoutes from "./routes/cases.routes.js";
import aiRoutes from "./routes/ai.routes.js";

export function createApp() {
  const app = express();

  // TODO: restrict this to a real allowlist before any production deploy.
  // Wide open ("*") is fine for local development, not for a public API.
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.send("CaseFlow API running");
  });

  app.use("/cases", casesRoutes);
  app.use("/", aiRoutes);

  return app;
}