"use server";

import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { runRoutes } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

async function uploadGpxIfPresent(formData: FormData) {
  const file = formData.get("gpx") as File | null;
  if (!file || file.size === 0) return undefined;

  const blob = await put(`run-routes/${Date.now()}-${file.name}`, file, {
    access: "public",
  });
  return blob.url;
}

function readRouteForm(formData: FormData) {
  return {
    name: formData.get("name") as string,
    distanceMiles: (formData.get("distanceMiles") as string) || null,
    difficulty: (formData.get("difficulty") as string) || null,
    description: (formData.get("description") as string) || null,
    startAddress: (formData.get("startAddress") as string) || null,
    runGoUrl: (formData.get("runGoUrl") as string) || null,
  };
}

export async function createRunRoute(formData: FormData) {
  await requireAdmin();
  const data = readRouteForm(formData);
  if (!data.name) return;

  const gpxBlobUrl = await uploadGpxIfPresent(formData);

  await db.insert(runRoutes).values({ ...data, gpxBlobUrl });

  revalidatePath("/admin/run-routes");
  revalidatePath("/run-routes");
}

export async function updateRunRoute(id: string, formData: FormData) {
  await requireAdmin();
  const data = readRouteForm(formData);
  if (!data.name) return;

  const gpxBlobUrl = await uploadGpxIfPresent(formData);

  await db
    .update(runRoutes)
    .set({ ...data, ...(gpxBlobUrl ? { gpxBlobUrl } : {}) })
    .where(eq(runRoutes.id, id));

  revalidatePath("/admin/run-routes");
  revalidatePath("/run-routes");
  redirect("/admin/run-routes");
}

export async function deleteRunRoute(id: string) {
  await requireAdmin();
  await db.delete(runRoutes).where(eq(runRoutes.id, id));
  revalidatePath("/admin/run-routes");
  revalidatePath("/run-routes");
}
