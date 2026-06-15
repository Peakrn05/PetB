import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authenticate, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user!.id },
      include: { pet: true, service: true, timeSlot: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.get("/admin/all", adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { user: { select: { id: true, name: true, email: true, phone: true } }, pet: true, service: true, timeSlot: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.post(
  "/",
  [
    body("petId").notEmpty(),
    body("serviceId").notEmpty(),
    body("timeSlotId").notEmpty(),
    body("notes").optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { petId, serviceId, timeSlotId, notes } = req.body;

      const pet = await prisma.pet.findFirst({ where: { id: petId, userId: req.user!.id } });
      if (!pet) {
        res.status(404).json({ error: "Pet not found" });
        return;
      }

      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        res.status(404).json({ error: "Service not found" });
        return;
      }

      const slot = await prisma.timeSlot.findUnique({ where: { id: timeSlotId } });
      if (!slot) {
        res.status(404).json({ error: "Time slot not found" });
        return;
      }

      if (slot.currentBookings >= slot.maxBookings) {
        res.status(409).json({ error: "Time slot is fully booked" });
        return;
      }

      const [reservation] = await prisma.$transaction([
        prisma.reservation.create({
          data: {
            userId: req.user!.id,
            petId,
            serviceId,
            timeSlotId,
            date: slot.date,
            startTime: slot.startTime,
            totalPrice: service.basePrice,
            notes: notes || "",
          },
          include: { pet: true, service: true, timeSlot: true },
        }),
        prisma.timeSlot.update({
          where: { id: timeSlotId },
          data: { currentBookings: { increment: 1 } },
        }),
      ]);

      res.status(201).json(reservation);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create reservation" });
    }
  }
);

router.put("/:id/cancel", async (req: AuthRequest, res: Response) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    if (reservation.status === "CANCELLED") {
      res.status(400).json({ error: "Already cancelled" });
      return;
    }

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: req.params.id },
        data: { status: "CANCELLED" },
        include: { pet: true, service: true, timeSlot: true },
      }),
      prisma.timeSlot.update({
        where: { id: reservation.timeSlotId },
        data: { currentBookings: { decrement: 1 } },
      }),
    ]);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
});

export default router;
