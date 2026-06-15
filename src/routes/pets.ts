import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(pets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pets" });
  }
});

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("species").isIn(["DOG", "CAT"]),
    body("size").optional().isIn(["SMALL", "MEDIUM", "LARGE"]),
    body("breed").optional().trim(),
    body("weight").optional().isFloat({ min: 0 }),
    body("age").optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, species, breed, size, weight, age } = req.body;
      const pet = await prisma.pet.create({
        data: {
          name,
          species,
          breed: breed || "",
          size: size || "MEDIUM",
          weight: weight || null,
          age: age || null,
          userId: req.user!.id,
        },
      });
      res.status(201).json(pet);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create pet" });
    }
  }
);

router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }

    const updated = await prisma.pet.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update pet" });
  }
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const pet = await prisma.pet.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!pet) {
      res.status(404).json({ error: "Pet not found" });
      return;
    }

    await prisma.pet.delete({ where: { id: req.params.id } });
    res.json({ message: "Pet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete pet" });
  }
});

export default router;
