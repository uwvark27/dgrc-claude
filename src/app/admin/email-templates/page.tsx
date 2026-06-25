import Link from "next/link";
import { db } from "@/db";
import { emailTemplates } from "@/db/schema";
import { createEmailTemplate, deleteEmailTemplate } from "./actions";

export default async function AdminEmailTemplatesPage() {
  const templates = await db
    .select()
    .from(emailTemplates)
    .orderBy(emailTemplates.name);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Email Templates
      </h1>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Subject</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id} className="border-b border-neutral-300">
              <td className="p-2">{template.name}</td>
              <td className="p-2">{template.subject}</td>
              <td className="p-2 text-right">
                <Link
                  href={`/admin/email-templates/${template.id}/edit`}
                  className="underline"
                >
                  Edit / Send
                </Link>{" "}
                <form
                  action={deleteEmailTemplate.bind(null, template.id)}
                  className="inline"
                >
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={3} className="p-2 text-neutral-500">
                No templates yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        New Template
      </h2>
      <form
        action={createEmailTemplate}
        className="mt-4 flex max-w-xl flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input name="name" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Subject
          <input name="subject" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Body
          <textarea
            name="body"
            required
            rows={8}
            placeholder="Plain text — separate paragraphs with a blank line."
            className="border border-black px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Save Template
        </button>
      </form>
    </div>
  );
}
