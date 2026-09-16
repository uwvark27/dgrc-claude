"use server";

import { put, del } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, eventGuests, eventRunRoutes, eventImages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const EVENT_TYPES = ["RUN", "MEMBER PARTY", "CHEER STATION", "MEDAL MONDAY", "OTHER"] as const;

function readEventForm(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const startAt = formData.get("startAt") as string;
  const endAtRaw = formData.get("endAt") as string;
  const locationId = (formData.get("locationId") as string) || null;
  const seasonNumberRaw = formData.get("seasonNumber") as string;
  const eventTypeRaw = formData.get("eventType") as string;
  const eventType = EVENT_TYPES.includes(eventTypeRaw as typeof EVENT_TYPES[number])
    ? eventTypeRaw
    : "RUN";
  const status = (formData.get("status") as string) || "scheduled";

  return {
    title,
    description,
    startAt: new Date(startAt),
    endAt: endAtRaw ? new Date(endAtRaw) : null,
    locationId: locationId || null,
    seasonNumber: seasonNumberRaw ? Number(seasonNumberRaw) : null,
    eventType,
    status: status as "scheduled" | "canceled" | "completed",
  };
}

function readRunRouteIds(formData: FormData): string[] {
  return formData.getAll("runRouteIds") as string[];
}

export async function createEvent(formData: FormData) {
  const session = await requireAdmin();
  const data = readEventForm(formData);
  if (!data.title || !data.startAt) return;

  const [event] = await db
    .insert(events)
    .values({ ...data, createdBy: session?.user?.id })
    .returning({ id: events.id });

  const runRouteIds = readRunRouteIds(formData);
  if (runRouteIds.length > 0) {
    await db.insert(eventRunRoutes).values(
      runRouteIds.map((runRouteId) => ({ eventId: event.id, runRouteId })),
    );
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/admin/events/${event.id}/edit`);
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin();
  const data = readEventForm(formData);
  if (!data.title || !data.startAt) return;

  await db.update(events).set(data).where(eq(events.id, id));

  // Replace run routes
  await db.delete(eventRunRoutes).where(eq(eventRunRoutes.eventId, id));
  const runRouteIds = readRunRouteIds(formData);
  if (runRouteIds.length > 0) {
    await db.insert(eventRunRoutes).values(
      runRouteIds.map((runRouteId) => ({ eventId: id, runRouteId })),
    );
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}/edit`);
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/");
  redirect("/admin/events");
}

export async function copyEvent(id: string) {
  await requireAdmin();

  const [source] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!source) return;

  const [newEvent] = await db
    .insert(events)
    .values({
      title: `${source.title} (copy)`,
      description: source.description,
      startAt: source.startAt,
      endAt: source.endAt,
      locationId: source.locationId,
      seasonNumber: source.seasonNumber,
      eventType: source.eventType,
      status: "scheduled",
    })
    .returning({ id: events.id });

  // Copy run routes
  const routes = await db
    .select({ runRouteId: eventRunRoutes.runRouteId })
    .from(eventRunRoutes)
    .where(eq(eventRunRoutes.eventId, id));
  if (routes.length > 0) {
    await db.insert(eventRunRoutes).values(
      routes.map((r) => ({ eventId: newEvent.id, runRouteId: r.runRouteId })),
    );
  }

  revalidatePath("/admin/events");
  redirect(`/admin/events/${newEvent.id}/edit`);
}

export async function deleteEvent(id: string) {
  await requireAdmin();

  // Delete blob images first
  const imgs = await db
    .select({ blobUrl: eventImages.blobUrl })
    .from(eventImages)
    .where(eq(eventImages.eventId, id));
  if (imgs.length > 0) {
    await Promise.all(imgs.map((img) => del(img.blobUrl)));
  }

  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

// ── Image management ──────────────────────────────────────────────────────────

export async function uploadEventImage(eventId: string, formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() ?? "jpg";
  const displayName = (formData.get("displayName") as string) || file.name;
  const isMain = formData.get("isMain") === "on";
  const timestamp = Date.now();
  const pathname = `images/events/Event${eventId}_${timestamp}.${ext}`;

  const { url } = await put(pathname, file, { access: "public" });

  // If this is marked main, unset existing main
  if (isMain) {
    await db
      .update(eventImages)
      .set({ isMain: false })
      .where(eq(eventImages.eventId, eventId));
  }

  const existingCount = await db
    .select({ id: eventImages.id })
    .from(eventImages)
    .where(eq(eventImages.eventId, eventId));

  await db.insert(eventImages).values({
    eventId,
    blobUrl: url,
    displayName,
    isMain: isMain || existingCount.length === 0,
    sortOrder: existingCount.length,
  });

  revalidatePath(`/admin/events/${eventId}/edit`);
}

export async function setMainImage(eventId: string, imageId: string) {
  await requireAdmin();
  await db
    .update(eventImages)
    .set({ isMain: false })
    .where(eq(eventImages.eventId, eventId));
  await db
    .update(eventImages)
    .set({ isMain: true })
    .where(eq(eventImages.id, imageId));
  revalidatePath(`/admin/events/${eventId}/edit`);
}

export async function deleteEventImage(eventId: string, imageId: string) {
  await requireAdmin();
  const [img] = await db
    .select({ blobUrl: eventImages.blobUrl, isMain: eventImages.isMain })
    .from(eventImages)
    .where(eq(eventImages.id, imageId))
    .limit(1);

  if (!img) return;
  await db.delete(eventImages).where(eq(eventImages.id, imageId));
  await del(img.blobUrl);

  // Promote oldest remaining to main if we deleted the main
  if (img.isMain) {
    const [next] = await db
      .select({ id: eventImages.id })
      .from(eventImages)
      .where(eq(eventImages.eventId, eventId))
      .limit(1);
    if (next) {
      await db
        .update(eventImages)
        .set({ isMain: true })
        .where(eq(eventImages.id, next.id));
    }
  }

  revalidatePath(`/admin/events/${eventId}/edit`);
}

export async function reorderEventImages(eventId: string, orderedIds: string[]) {
  await requireAdmin();
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(eventImages)
        .set({ sortOrder: index })
        .where(eq(eventImages.id, id)),
    ),
  );
  revalidatePath(`/admin/events/${eventId}/edit`);
}

// ── Event guests ──────────────────────────────────────────────────────────────

export async function addEventGuest(eventId: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const roleOrBio = (formData.get("roleOrBio") as string) || null;
  if (!name) return;

  await db.insert(eventGuests).values({ eventId, name, roleOrBio });

  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEventGuest(eventId: string, guestId: string) {
  await requireAdmin();
  await db.delete(eventGuests).where(eq(eventGuests.id, guestId));
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath("/events");
  revalidatePath("/");
}
