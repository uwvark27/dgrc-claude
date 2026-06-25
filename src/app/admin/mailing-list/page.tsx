import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { addSubscriber, deleteSubscriber, removeSubscriber } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function AdminMailingListPage() {
  const allSubscribers = await db
    .select()
    .from(subscribers)
    .orderBy(subscribers.email);

  const active = allSubscribers.filter((s) => !s.unsubscribedAt);
  const unsubscribed = allSubscribers.filter((s) => s.unsubscribedAt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold uppercase tracking-tight">
          Mailing List
        </h1>
        <a
          href="/admin/mailing-list/export"
          className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wide hover:bg-black hover:text-white"
        >
          Export CSV
        </a>
      </div>
      <p className="mt-2 text-neutral-600">
        {active.length} active, {unsubscribed.length} unsubscribed.
      </p>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Name</th>
            <th className="p-2">Subscribed</th>
            <th className="p-2">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {allSubscribers.map((subscriber) => (
            <tr key={subscriber.id} className="border-b border-neutral-300">
              <td className="p-2">{subscriber.email}</td>
              <td className="p-2">{subscriber.name}</td>
              <td className="p-2">
                {dateFormatter.format(subscriber.subscribedAt)}
              </td>
              <td className="p-2">
                {subscriber.unsubscribedAt ? "Unsubscribed" : "Active"}
              </td>
              <td className="p-2 text-right">
                {!subscriber.unsubscribedAt && (
                  <form
                    action={removeSubscriber.bind(null, subscriber.id)}
                    className="inline"
                  >
                    <button type="submit" className="underline">
                      Unsubscribe
                    </button>
                  </form>
                )}{" "}
                <form
                  action={deleteSubscriber.bind(null, subscriber.id)}
                  className="inline"
                >
                  <button type="submit" className="underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {allSubscribers.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-neutral-500">
                No subscribers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Subscriber
      </h2>
      <form action={addSubscriber} className="mt-4 flex max-w-md flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input name="name" className="border border-black px-3 py-2" />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Subscriber
        </button>
      </form>
    </div>
  );
}
