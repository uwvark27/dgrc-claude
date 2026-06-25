import { and, eq, gte, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function DiscountCodesPage() {
  const codes = await db
    .select()
    .from(discountCodes)
    .where(
      and(
        eq(discountCodes.isActive, true),
        or(isNull(discountCodes.expiresAt), gte(discountCodes.expiresAt, new Date())),
      ),
    )
    .orderBy(discountCodes.code);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold uppercase tracking-tight">
        Discount Codes
      </h1>
      <p className="mt-4 text-neutral-700">
        Partner discounts for DGRC. No login required.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {codes.map((code) => (
          <article key={code.id} className="border border-black p-5">
            <p className="font-mono text-lg font-bold">{code.code}</p>
            <p className="mt-2 text-neutral-700">{code.description}</p>
            {code.expiresAt && (
              <p className="mt-2 text-sm text-neutral-500">
                Expires {dateFormatter.format(code.expiresAt)}
              </p>
            )}
          </article>
        ))}
        {codes.length === 0 && (
          <p className="text-neutral-600">No active discount codes right now.</p>
        )}
      </div>
    </div>
  );
}
