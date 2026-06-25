import Link from "next/link";
import { db } from "@/db";
import { discountCodes } from "@/db/schema";
import { createDiscountCode, deleteDiscountCode } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminDiscountCodesPage() {
  const allCodes = await db
    .select()
    .from(discountCodes)
    .orderBy(discountCodes.code);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Discount Codes
      </h1>
      <p className="mt-2 text-neutral-600">
        Shown publicly on /discount-codes — no login required to view.
      </p>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Code</th>
            <th className="p-2">Description</th>
            <th className="p-2">Expires</th>
            <th className="p-2">Active</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allCodes.map((code) => (
            <tr key={code.id} className="border-b border-neutral-300">
              <td className="p-2 font-mono">{code.code}</td>
              <td className="p-2">{code.description}</td>
              <td className="p-2">
                {code.expiresAt ? dateFormatter.format(code.expiresAt) : "—"}
              </td>
              <td className="p-2">{code.isActive ? "Yes" : "No"}</td>
              <td className="p-2 text-right">
                <Link
                  href={`/admin/discount-codes/${code.id}/edit`}
                  className="underline"
                >
                  Edit
                </Link>{" "}
                <form action={deleteDiscountCode.bind(null, code.id)} className="inline">
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allCodes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-neutral-500">
                No discount codes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Discount Code
      </h2>
      <form
        action={createDiscountCode}
        className="mt-4 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Code
          <input name="code" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Expires
          <input type="date" name="expiresAt" className="border border-black px-3 py-2" />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Code
        </button>
      </form>
    </div>
  );
}
