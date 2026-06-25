import { db } from "@/db";
import { clubMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createClubMember,
  deleteClubMember,
  getUnlinkedUsers,
  linkClubMember,
  unlinkClubMember,
  updateClubMember,
} from "./actions";

export default async function AdminRosterPage() {
  const [members, unlinkedUsers] = await Promise.all([
    db
      .select({
        id: clubMembers.id,
        name: clubMembers.name,
        email: clubMembers.email,
        isActive: clubMembers.isActive,
        notes: clubMembers.notes,
        userId: clubMembers.userId,
        linkedName: users.name,
        linkedEmail: users.email,
      })
      .from(clubMembers)
      .leftJoin(users, eq(clubMembers.userId, users.id))
      .orderBy(clubMembers.name),
    getUnlinkedUsers(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">Roster</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        This is the real DGRC membership list. Adding someone here is what
        lets them register a website account (their signup email must match
        what&apos;s on file below). Linking connects a roster entry to an
        already-registered website account.
      </p>

      <table className="mt-8 w-full border border-black text-sm">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Active</th>
            <th className="p-2">Linked Account</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-neutral-300 align-top">
              <td className="p-2">{member.name}</td>
              <td className="p-2">{member.email}</td>
              <td className="p-2">{member.isActive ? "Yes" : "No"}</td>
              <td className="p-2">
                {member.userId ? (
                  <div>
                    <p>
                      {member.linkedName} ({member.linkedEmail})
                    </p>
                    <form action={unlinkClubMember.bind(null, member.id)}>
                      <button type="submit" className="underline">
                        Unlink
                      </button>
                    </form>
                  </div>
                ) : unlinkedUsers.length > 0 ? (
                  <form
                    action={linkClubMember.bind(null, member.id)}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="userId"
                      required
                      className="border border-black px-2 py-1"
                    >
                      <option value="">— Select account —</option>
                      {unlinkedUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="underline">
                      Link
                    </button>
                  </form>
                ) : (
                  <span className="text-neutral-500">Not linked</span>
                )}
              </td>
              <td className="p-2 text-right">
                <form action={deleteClubMember.bind(null, member.id)}>
                  <button type="submit" className="underline">
                    Remove
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={5} className="p-2 text-neutral-500">
                No club members added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-xl font-bold uppercase tracking-wide">
        Add Club Member
      </h2>
      <form
        action={createClubMember}
        className="mt-4 flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <input name="name" required className="border border-black px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email (the email they&apos;ll use to register)
          <input
            name="email"
            type="email"
            required
            className="border border-black px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Notes
          <textarea name="notes" className="border border-black px-3 py-2" />
        </label>
        <button
          type="submit"
          className="mt-2 self-start border border-black bg-black px-6 py-2 text-sm font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
        >
          Add Member
        </button>
      </form>

      <details className="mt-10 max-w-xl text-sm text-neutral-600">
        <summary className="cursor-pointer font-medium">
          Edit an existing member
        </summary>
        <div className="mt-4 flex flex-col gap-6">
          {members.map((member) => (
            <form
              key={member.id}
              action={updateClubMember.bind(null, member.id)}
              className="flex flex-col gap-2 border-t border-neutral-300 pt-4"
            >
              <p className="font-medium text-black">{member.name}</p>
              <input
                name="name"
                defaultValue={member.name}
                required
                className="border border-black px-3 py-2"
              />
              <input
                name="email"
                type="email"
                defaultValue={member.email ?? ""}
                required
                className="border border-black px-3 py-2"
              />
              <textarea
                name="notes"
                defaultValue={member.notes ?? ""}
                className="border border-black px-3 py-2"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={member.isActive}
                />
                Active
              </label>
              <button
                type="submit"
                className="self-start border border-black px-4 py-1 uppercase tracking-wide hover:bg-black hover:text-white"
              >
                Save
              </button>
            </form>
          ))}
        </div>
      </details>
    </div>
  );
}
