# PawCare Backend API

REST API for pet care reservation system.

## Tech Stack
- Express.js + TypeScript
- Prisma ORM + SQLite
- JWT authentication (jsonwebtoken + bcryptjs)
- express-validator for input validation

## Project Structure
```
src/
  index.ts              — Express app entry, routes, middleware
  lib/prisma.ts         — Prisma client singleton
  middleware/auth.ts     — JWT authenticate, adminOnly, signToken
  middleware/errorHandler.ts
  routes/
    auth.ts             — POST /register, /login, GET /me
    services.ts         — GET / (filter by category/petType/search), GET /:id
    pets.ts             — CRUD (auth required, user-scoped)
    timeslots.ts        — GET / (filter by date), POST / (admin)
    reservations.ts     — GET /, POST /, PUT /:id/cancel, GET /admin/all
prisma/
  schema.prisma         — User, Pet, Service, TimeSlot, Reservation
  seed.ts               — 23 services + 30 days of time slots
  dev.db                — SQLite database
```

## Commands
```bash
npx tsx src/index.ts      # Start dev server on :4000
npx tsx prisma/seed.ts    # Re-seed database
npx prisma db push        # Push schema changes
npx prisma generate       # Regenerate client
npm run build             # Compile TypeScript
```

## API Endpoints
All prefixed with /api

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Get JWT token |
| GET | /auth/me | Yes | Current user |
| GET | /services | No | List services (filter: category, petType, search) |
| GET | /services/:id | No | Get service |
| GET | /pets | Yes | User's pets |
| POST | /pets | Yes | Add pet |
| PUT | /pets/:id | Yes | Update pet |
| DELETE | /pets/:id | Yes | Delete pet |
| GET | /timeslots | No | List slots (filter: date, available) |
| GET | /reservations | Yes | User's reservations |
| POST | /reservations | Yes | Create booking (validates slot capacity) |
| PUT | /reservations/:id/cancel | Yes | Cancel booking |

## Environment
- JWT_SECRET defaults to hardcoded dev key — change for production
- CORS allows localhost:3000 and :3001
- Port 4000 (configurable via PORT env var)
