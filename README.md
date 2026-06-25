# DGRC — Dancing Gnome Running Club

Full-stack club site: events/calendar, member perks, discount codes, a
photo gallery, run routes, a mailing list, and mass email — built on
Next.js, Neon Postgres (via Drizzle), Vercel Blob, and Resend.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: Neon Postgres via Drizzle ORM
- **Auth**: Auth.js v5 (credentials), roles: `admin` | `user`
- **File storage**: Vercel Blob (perk photos, gallery photos, route GPX files)
- **Email**: Resend (mailing-list mass sends)

## Membership model

Website accounts and DGRC club membership are **separate**. Anyone can
register an account, but the form is hard-gated: the email must already
exist as an active, unlinked row in the `club_members` table (added by an
admin in `/admin/roster`). A matching signup auto-links the new account to
that membership record. `club_members.user_id` being set is what unlocks
RSVPing to events and uploading photos — having a login alone does not.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run db:push              # create tables in your Neon database
npm run seed:admin            # bootstrap your first admin login (see below)
npm run dev
```

### Environment variables (`.env.local`)

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard, or the Vercel Neon integration |
| `AUTH_SECRET` | `npx auth secret` |
| `BLOB_READ_WRITE_TOKEN` | Vercel project → Storage → Blob (must be a **public**-access store — perk/gallery photos need public URLs) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `EMAIL_FROM` | A Resend-verified sender, e.g. `DGRC <onboarding@resend.dev>` for testing, or a verified custom domain for production sends |
| `NEXT_PUBLIC_APP_URL` | The site's public URL — used to build unsubscribe links and the email logo |

### Bootstrapping the first admin

There's no UI to create the first admin (every other admin is promoted by
an existing admin via the database/roster). Run:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=choose-a-strong-password npm run seed:admin
```

Safe to re-run — it updates the existing user (and re-promotes to admin) if
the email already exists, rather than creating a duplicate.

## Deploying

1. Push to GitHub (already done for this repo: `uwvark27/dgrc-claude`).
2. In Vercel: **New Project** → import the GitHub repo.
3. Add the env vars above in Vercel project settings (or add the Neon
   integration, which sets `DATABASE_URL` for you).
4. Deploy. Then run `npm run db:push` and `npm run seed:admin` once
   pointed at the production `DATABASE_URL` (e.g. via `vercel env pull`
   into a local `.env.local`, or run them from a one-off Vercel deployment
   shell).

## Useful scripts

- `npm run db:push` — push the Drizzle schema to the database
- `npm run db:studio` — browse the database in Drizzle Studio
- `npm run seed:admin` — create or promote an admin user
- `npm run lint` — ESLint
