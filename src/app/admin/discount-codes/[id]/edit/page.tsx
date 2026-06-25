import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { updateDiscountCode } from "../../actions";

function toDateInput(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditDiscountCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [code] = await db
    .select()
    .from(discountCodes)
    .where(eq(discountCodes.id, id))
    .limit(1);

  if (!code) notFound();

  const updateDiscountCodeWithId = updateDiscountCode.bind(null, id);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Edit Discount Code
      </h1>

      <form
        action={updateDiscountCodeWithId}
        className="mt-8 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Code
          <input
            name="code"
            required
            defaultValue={code.code}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            defaultValue={code.description}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Expires
          <input
            type="date"
            name="expiresAt"
            defaultValue={toDateInput(code.expiresAt)}
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isActive" defaultChecked={code.isActive} />
          Active
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Save
        </button>
      </form>
    </div>
  );
}
