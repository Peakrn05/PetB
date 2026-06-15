import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  { name: "Small Dog Bath", description: "Full bath with shampoo, blow dry, and brush for small breeds (under 10kg)", category: "GROOMING", basePrice: 300, duration: 45, petType: "DOG" },
  { name: "Medium Dog Bath", description: "Full bath with shampoo, blow dry, and brush for medium breeds (10-25kg)", category: "GROOMING", basePrice: 450, duration: 60, petType: "DOG" },
  { name: "Large Dog Bath", description: "Full bath with shampoo, blow dry, and brush for large breeds (over 25kg)", category: "GROOMING", basePrice: 600, duration: 75, petType: "DOG" },
  { name: "Small Dog Haircut", description: "Professional styling and haircut for small breeds", category: "GROOMING", basePrice: 500, duration: 60, petType: "DOG" },
  { name: "Medium Dog Haircut", description: "Professional styling and haircut for medium breeds", category: "GROOMING", basePrice: 700, duration: 75, petType: "DOG" },
  { name: "Large Dog Haircut", description: "Professional styling and haircut for large breeds", category: "GROOMING", basePrice: 1000, duration: 90, petType: "DOG" },
  { name: "Dog Nail Trimming", description: "Safe nail trimming and filing for dogs", category: "GROOMING", basePrice: 150, duration: 15, petType: "DOG" },
  { name: "Dog Ear Cleaning", description: "Gentle ear cleaning and inspection", category: "GROOMING", basePrice: 100, duration: 15, petType: "DOG" },
  { name: "Small Dog Full Grooming", description: "Complete package: bath, haircut, nail trim, ear clean for small breeds", category: "GROOMING", basePrice: 800, duration: 120, petType: "DOG" },
  { name: "Medium Dog Full Grooming", description: "Complete package: bath, haircut, nail trim, ear clean for medium breeds", category: "GROOMING", basePrice: 1200, duration: 150, petType: "DOG" },
  { name: "Large Dog Full Grooming", description: "Complete package: bath, haircut, nail trim, ear clean for large breeds", category: "GROOMING", basePrice: 1500, duration: 180, petType: "DOG" },
  { name: "Cat Bath", description: "Gentle bath with cat-safe shampoo and blow dry", category: "GROOMING", basePrice: 400, duration: 45, petType: "CAT" },
  { name: "Cat Haircut", description: "Professional styling and haircut for cats", category: "GROOMING", basePrice: 500, duration: 60, petType: "CAT" },
  { name: "Cat Nail Trimming", description: "Safe and gentle nail trimming for cats", category: "GROOMING", basePrice: 150, duration: 15, petType: "CAT" },
  { name: "Cat Full Grooming", description: "Complete package: bath, haircut, nail trim for cats", category: "GROOMING", basePrice: 700, duration: 90, petType: "CAT" },
  { name: "Dog DHPP Vaccine", description: "Distemper, Hepatitis, Parainfluenza, Parvovirus protection", category: "VACCINE", basePrice: 500, duration: 30, petType: "DOG" },
  { name: "Dog Rabies Vaccine", description: "Essential rabies protection — required by Thai law", category: "VACCINE", basePrice: 350, duration: 30, petType: "DOG" },
  { name: "Dog Deworming", description: "Comprehensive internal parasite treatment", category: "VACCINE", basePrice: 200, duration: 15, petType: "DOG" },
  { name: "Dog Tick & Flea Treatment", description: "Topical tick and flea prevention treatment", category: "VACCINE", basePrice: 300, duration: 20, petType: "DOG" },
  { name: "Cat FVRCP Vaccine", description: "Feline viral rhinotracheitis, calicivirus, panleukopenia protection", category: "VACCINE", basePrice: 500, duration: 30, petType: "CAT" },
  { name: "Cat Rabies Vaccine", description: "Essential rabies protection — required by Thai law", category: "VACCINE", basePrice: 350, duration: 30, petType: "CAT" },
  { name: "Cat Deworming", description: "Comprehensive internal parasite treatment", category: "VACCINE", basePrice: 200, duration: 15, petType: "CAT" },
  { name: "Cat Tick & Flea Treatment", description: "Topical tick and flea prevention treatment", category: "VACCINE", basePrice: 300, duration: 20, petType: "CAT" },
];

const timeSlotHours = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
];

async function main() {
  console.log("Clearing existing data...");
  await prisma.reservation.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.service.deleteMany();

  console.log("Seeding services...");
  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log(`Created ${services.length} services`);

  console.log("Seeding time slots for next 30 days...");
  const today = new Date();
  let slotCount = 0;

  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);

    if (date.getDay() === 0) continue;

    const dateStr = date.toISOString().split("T")[0];

    for (const slot of timeSlotHours) {
      await prisma.timeSlot.create({
        data: {
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          maxBookings: 3,
          currentBookings: 0,
        },
      });
      slotCount++;
    }
  }
  console.log(`Created ${slotCount} time slots`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
