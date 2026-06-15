import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import serviceRoutes from "./routes/services";
import petRoutes from "./routes/pets";
import timeslotRoutes from "./routes/timeslots";
import reservationRoutes from "./routes/reservations";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/timeslots", timeslotRoutes);
app.use("/api/reservations", reservationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Pet Care API running on http://localhost:${PORT}`);
});
