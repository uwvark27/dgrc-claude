"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, eventGuests } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

function readEventForm(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const startAt = formData.get("startAt") as string;
  const endAtRaw = formData.get("endAt") as string;
  const locationId = (formData.get("locationId") as string) || null;
  const seasonNumberRaw = formData.get("seasonNumber") as string;
  const eventType = (formData.get("eventType") as string) || null;
  const isSpecialEvent = formData.get("isSpecialEvent") === "on";
  const specialEventDetails =
    (formData.get("specialEventDetails") as string) || null;
  const notice = (formData.get("notice") as string) || null;
  const status = formData.get("status") as "scheduled" | "canceled" | "completed";

  return {
    title,
    description,
    startAt: new Date(startAt),
    endAt: endAtRaw ? new Date(endAtRaw) : null,
    locationId: locationId || null,
    seasonNumber: seasonNumberRaw ? Number(seasonNumberRaw) : null,
    eventType,
    isSpecialEvent,
    specialEventDetails,
    notice,
    status,
  };
}

export async function createEvent(formData: FormData) {
  const session = await requireAdmin();
  const data = readEventForm(formData);
  if (!data.title || !data.startAt) return;

  await db.insert(events).values({ ...data, createdBy: session?.user?.id });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function updateEvent(id: string, formData: FormData) {
  await requireAdmin();
  const data = readEventForm(formData);
  if (!data.title || !data.startAt) return;

  await db.update(events).set(data).where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

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
