import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "member"]);
export const eventStatusEnum = pgEnum("event_status", [
  "scheduled",
  "canceled",
  "completed",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeToken: text("unsubscribe_token").notNull().unique(),
});

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  notes: text("notes"),
});

export const perks = pgTable("perks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  partnerName: text("partner_name"),
  photoBlobUrl: text("photo_blob_url"),
  season: text("season"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const discountCodes = pgTable("discount_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  locationId: uuid("location_id").references(() => locations.id),
  seasonNumber: integer("season_number"),
  eventType: text("event_type"),
  isSpecialEvent: boolean("is_special_event").notNull().default(false),
  specialEventDetails: text("special_event_details"),
  notice: text("notice"),
  status: eventStatusEnum("status").notNull().default("scheduled"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventGuests = pgTable("event_guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  roleOrBio: text("role_or_bio"),
});

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  blobUrl: text("blob_url").notNull(),
  caption: text("caption"),
  eventId: uuid("event_id").references(() => events.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  approved: boolean("approved").notNull().default(false),
});

export const runRoutes = pgTable("run_routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  distanceMiles: numeric("distance_miles", { precision: 5, scale: 2 }),
  difficulty: text("difficulty"),
  description: text("description"),
  startAddress: text("start_address"),
  runGoUrl: text("rungo_url"),
  gpxBlobUrl: text("gpx_blob_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailSends = pgTable("email_sends", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").references(() => emailTemplates.id),
  sentBy: uuid("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  recipientCount: integer("recipient_count").notNull().default(0),
});
