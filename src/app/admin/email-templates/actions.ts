"use server";

import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { emailSends, emailTemplates, subscribers } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { getResendClient, renderEmailHtml } from "@/lib/email";

export async function createEmailTemplate(formData: FormData) {
  const session = await requireAdmin();
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  if (!name || !subject || !body) return;

  await db.insert(emailTemplates).values({
    name,
    subject,
    body,
    createdBy: session?.user?.id,
  });

  revalidatePath("/admin/email-templates");
}

export async function updateEmailTemplate(id: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  if (!name || !subject || !body) return;

  await db
    .update(emailTemplates)
    .set({ name, subject, body, updatedAt: new Date() })
    .where(eq(emailTemplates.id, id));

  revalidatePath("/admin/email-templates");
  redirect("/admin/email-templates");
}

export async function deleteEmailTemplate(id: string) {
  await requireAdmin();
  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  revalidatePath("/admin/email-templates");
}

export async function sendEmailTemplate(id: string) {
  const session = await requireAdmin();

  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .limit(1);
  if (!template) return { error: "Template not found" };

  const activeSubscribers = await db
    .select()
    .from(subscribers)
    .where(isNull(subscribers.unsubscribedAt));

  if (activeSubscribers.length === 0) {
    return { error: "No active subscribers to send to." };
  }

  const resend = getResendClient();
  const from = process.env.EMAIL_FROM ?? "DGRC <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const batchSize = 90;
  let sentCount = 0;

  for (let i = 0; i < activeSubscribers.length; i += batchSize) {
    const batch = activeSubscribers.slice(i, i + batchSize);
    const emails = batch.map((subscriber) => ({
      from,
      to: [subscriber.email],
      subject: template.subject,
      html: renderEmailHtml(
        template.body,
        `${appUrl}/unsubscribe?token=${subscriber.unsubscribeToken}`,
      ),
    }));

    const result = await resend.batch.send(emails);
    if (result.error) {
      return { error: result.error.message };
    }
    sentCount += batch.length;
  }

  await db.insert(emailSends).values({
    templateId: template.id,
    sentBy: session?.user?.id,
    recipientCount: sentCount,
  });

  revalidatePath("/admin/email-templates");
  return { success: true, sentCount };
}
