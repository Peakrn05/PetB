import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, petType, search } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (petType) where.petType = { in: [petType as string, "BOTH"] };
    if (search) where.name = { contains: search as string };

    const services = await prisma.service.findMany({ where, orderBy: { category: "asc" } });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

export default router;
