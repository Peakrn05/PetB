import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { date, available } = req.query;

    const where: Record<string, unknown> = {};
    if (date) where.date = date;

    const slots = await prisma.timeSlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const result = available === "true"
      ? slots.filter((s) => s.currentBookings < s.maxBookings)
      : slots;

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
});

router.post("/", authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { date, startTime, endTime, maxBookings } = req.body;
    const slot = await prisma.timeSlot.create({
      data: { date, startTime, endTime, maxBookings: maxBookings || 3 },
    });
    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create time slot" });
  }
});

export default router;
