import { eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { emailSends, emailTemplates, subscribers } from "@/db/schema";
import { updateEmailTemplate } from "../../actions";
import { SendButton } from "./SendButton";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function EditEmailTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [template] = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.id, id))
    .limit(1);
  if (!template) notFound();

  const [activeSubscribers, sendLog] = await Promise.all([
    db.select().from(subscribers).where(isNull(subscribers.unsubscribedAt)),
    db
      .select()
      .from(emailSends)
      .where(eq(emailSends.templateId, id))
      .orderBy(emailSends.sentAt),
  ]);
  const activeSubscriberCount = activeSubscribers.length;

  const updateTemplateWithId = updateEmailTemplate.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Template
      </h1>

      <form
        action={updateTemplateWithId}
        className="mt-6 flex max-w-xl flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={template.name}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Subject
          <input
            name="subject"
            required
            defaultValue={template.subject}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Body
          <textarea
            name="body"
            required
            rows={10}
            defaultValue={template.body}
            className="border border-black px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black px-6 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
        >
          Save
        </button>
      </form>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Send
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        Sends to every active mailing-list subscriber, with a per-recipient
        unsubscribe link.
      </p>
      <div className="mt-4">
        <SendButton templateId={id} recipientCount={activeSubscriberCount} />
      </div>

      {sendLog.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
            Send History
          </h2>
          <ul className="mt-4 flex flex-col gap-1 text-sm text-neutral-700">
            {sendLog.map((send) => (
              <li key={send.id}>
                {dateTimeFormatter.format(send.sentAt)} — {send.recipientCount}{" "}
                recipients
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
