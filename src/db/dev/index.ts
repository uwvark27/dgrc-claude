import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import bcrypt from "bcryptjs";
import * as schema from "../schema";

// DEV ONLY — never imported when DATABASE_URL is set (see src/db/index.ts).
// Runs an in-memory Postgres (PGlite) with the real schema and sample data
// so the site renders locally without Neon credentials.
//
// Log in locally with: admin@dgrc.local / password (site admin + club member)
// or runner@dgrc.local / password (club member).
//
// schema.sql is generated — refresh it after schema changes with:
//   npx drizzle-kit export --dialect postgresql --schema ./src/db/schema.ts > src/db/dev/schema.sql

type DevDb = ReturnType<typeof drizzle<typeof schema>>;

export async function createDevDb(): Promise<DevDb> {
  const client = new PGlite();
  const ddl = readFileSync(join(process.cwd(), "src/db/dev/schema.sql"), "utf8");
  await client.exec(ddl);
  const db = drizzle(client, { schema });
  await seed(db);
  console.log(
    "[dev-db] DATABASE_URL not set — using in-memory PGlite with sample data. " +
      "Log in with admin@dgrc.local / password",
  );
  return db;
}

/** Next occurrence of a weekday (0=Sun..6=Sat) at a local time, offset by whole weeks. */
function nextWeekday(weekday: number, hour: number, minute = 0, weeksOut = 0) {
  const d = new Date();
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7) + weeksOut * 7);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function daysAgo(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seed(db: DevDb) {
  const passwordHash = bcrypt.hashSync("password", 10);

  const [adminUser, runnerUser] = await db
    .insert(schema.users)
    .values([
      { name: "Gnorm Admin", email: "admin@dgrc.local", passwordHash, role: "admin" },
      { name: "Casey Runner", email: "runner@dgrc.local", passwordHash, role: "user" },
    ])
    .returning();

  await db.insert(schema.clubMembers).values([
    { name: "Gnorm Admin", email: "admin@dgrc.local", userId: adminUser.id, linkedAt: new Date() },
    { name: "Casey Runner", email: "runner@dgrc.local", userId: runnerUser.id, linkedAt: new Date() },
    { name: "Jordan Miles", email: "jordan@example.com" },
  ]);

  const [taproom, riverfront] = await db
    .insert(schema.locations)
    .values([
      {
        name: "Dancing Gnome — 925 Main",
        address: "925 Main St, Sharpsburg, PA 15215",
        notes: "Meet on the patio. Stick around after for a pour.",
      },
      {
        name: "Riverfront 47 Trailhead",
        address: "47th St & AVRR Trail, Pittsburgh, PA",
      },
    ])
    .returning();

  const [loop5k, riverOut, bridgeClimb] = await db
    .insert(schema.runRoutes)
    .values([
      {
        name: "Sharpsburg Social 5K",
        distanceMiles: "3.10",
        difficulty: "Easy",
        description:
          "The Thursday classic — flat loop through Sharpsburg, back to the taproom. All paces, nobody runs alone.",
        startAddress: "925 Main St, Sharpsburg, PA 15215",
        runGoUrl: "https://routes.rungoapp.com/route/example-5k",
      },
      {
        name: "Riverfront Out-and-Back",
        distanceMiles: "4.60",
        difficulty: "Moderate",
        description:
          "Down the Allegheny riverfront trail and back. Gravel and boardwalk, river views the whole way.",
        startAddress: "47th St & AVRR Trail, Pittsburgh, PA",
        runGoUrl: "https://routes.rungoapp.com/route/example-river",
      },
      {
        name: "Highland Bridge Climb",
        distanceMiles: "6.20",
        difficulty: "Hard",
        description:
          "Over the Highland Park Bridge, around the reservoir loop, and home. One real hill — bragging rights included.",
        startAddress: "925 Main St, Sharpsburg, PA 15215",
        runGoUrl: "https://routes.rungoapp.com/route/example-climb",
      },
    ])
    .returning();

  const [thuRun, longRun, kickoff, finale, pastThu] = await db
    .insert(schema.events)
    .values([
      {
        title: "Thursday Run Club",
        description:
          "The weekly one. 5K social pace from the taproom — walkers welcome, dogs welcome, zero drop. First pour's on Gnorm if it's your first run.",
        startAt: nextWeekday(4, 18, 30),
        locationId: taproom.id,
        seasonNumber: 12,
        eventType: "Group Run",
        createdBy: adminUser.id,
      },
      {
        title: "Saturday Long Run",
        description:
          "Riverfront miles before the taproom opens. Two pace groups, coffee after.",
        startAt: nextWeekday(6, 9, 0),
        locationId: riverfront.id,
        seasonNumber: 12,
        eventType: "Long Run",
        createdBy: adminUser.id,
      },
      {
        title: "Season 12 Kickoff Party",
        description:
          "New season, new routes, new club shirts. Run the Social 5K, then stick around for a tap takeover and route reveal.",
        startAt: nextWeekday(4, 18, 30, 2),
        locationId: taproom.id,
        seasonNumber: 12,
        eventType: "Party",
        createdBy: adminUser.id,
      },
      {
        title: "Season 11 Finale",
        description: "We closed out season 11 with the bridge climb and a patio hang.",
        startAt: daysAgo(12, 18, 30),
        locationId: taproom.id,
        seasonNumber: 11,
        eventType: "Group Run",
        status: "completed",
        createdBy: adminUser.id,
      },
      {
        title: "Thursday Run Club",
        description: "Weekly social 5K from the taproom.",
        startAt: daysAgo(5, 18, 30),
        locationId: taproom.id,
        seasonNumber: 12,
        eventType: "Group Run",
        status: "completed",
        createdBy: adminUser.id,
      },
    ])
    .returning();

  await db.insert(schema.eventGuests).values([
    {
      eventId: kickoff.id,
      name: "Bethany Park",
      roleOrBio: "Steel City Stride coach — form clinic before the run",
    },
  ]);

  await db.insert(schema.eventRunRoutes).values([
    { eventId: thuRun.id, runRouteId: loop5k.id },
    { eventId: longRun.id, runRouteId: riverOut.id },
    { eventId: kickoff.id, runRouteId: loop5k.id },
    { eventId: finale.id, runRouteId: bridgeClimb.id },
  ]);

  await db.insert(schema.eventImages).values([
    { eventId: kickoff.id, blobUrl: "/Beer.jpg", displayName: "Kickoff", isMain: true },
    { eventId: finale.id, blobUrl: "/RunClubPhoto1.jpg", displayName: "Finale crew", isMain: true },
  ]);

  await db.insert(schema.photos).values([
    { blobUrl: "/RunClubPhoto1.jpg", caption: "Season 11 finale crew", eventId: finale.id, uploadedBy: adminUser.id, approved: true },
    { blobUrl: "/RunClubPhoto2.jpg", caption: "Full house at the taproom", eventId: finale.id, uploadedBy: adminUser.id, approved: true },
    { blobUrl: "/RunClubPhoto3.jpg", caption: "Thursday regulars", eventId: pastThu.id, uploadedBy: runnerUser.id, approved: true },
    { blobUrl: "/Beer.jpg", caption: "Post-run pour", uploadedBy: runnerUser.id, approved: true },
    { blobUrl: "/Gnorm.jpg", caption: "Gnorm keeping watch", uploadedBy: adminUser.id, approved: true },
  ]);

  await db.insert(schema.discountCodes).values([
    {
      code: "RUNCLUB10",
      description: "10% off drafts at the taproom on run nights",
      expiresAt: nextWeekday(4, 23, 59, 8),
    },
  ]);

  await db.insert(schema.perks).values([
    {
      title: "First pour free",
      description: "Show up for your first Thursday run and your first draft is on the house.",
      partnerName: "Dancing Gnome",
      season: "Season 12",
    },
  ]);
}
