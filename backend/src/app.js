import express from "express";
import cors from "cors";
import jdRoutes from "./routes/jdRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/jd", jdRoutes);
app.use("/api/applications", applicationRoutes);

app.use(errorHandler);

export default app;
