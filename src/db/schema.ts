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
import { relations } from "drizzle-orm";

// "role" only distinguishes site admins from everyone else. Creating a
// website account does NOT make someone a DGRC member — real club
// membership is tracked in `clubMembers` below, and an admin is the one
// who links a club member to a website account.
export const roleEnum = pgEnum("role", ["admin", "user"]);
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
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The real-world running club roster, maintained by admins. A row here
// represents an actual DGRC member regardless of whether they have a
// website account. `userId` is set by an admin once they link this club
// member to a registered website account (see /admin/roster) — only then
// can that person RSVP to events or upload photos.
export const clubMembers = pgTable("club_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  linkedAt: timestamp("linked_at"),
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

export const eventRunRoutes = pgTable("event_run_routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  runRouteId: uuid("run_route_id")
    .notNull()
    .references(() => runRoutes.id, { onDelete: "cascade" }),
});

export const eventImages = pgTable("event_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  displayName: text("display_name"),
  isMain: boolean("is_main").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  guests: many(eventGuests),
  runRoutes: many(eventRunRoutes),
  images: many(eventImages),
}));

export const eventGuestsRelations = relations(eventGuests, ({ one }) => ({
  event: one(events, {
    fields: [eventGuests.eventId],
    references: [events.id],
  }),
}));

export const eventRunRoutesRelations = relations(eventRunRoutes, ({ one }) => ({
  event: one(events, { fields: [eventRunRoutes.eventId], references: [events.id] }),
  runRoute: one(runRoutes, { fields: [eventRunRoutes.runRouteId], references: [runRoutes.id] }),
}));

export const eventImagesRelations = relations(eventImages, ({ one }) => ({
  event: one(events, { fields: [eventImages.eventId], references: [events.id] }),
}));

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  blobUrl: text("blob_url").notNull(),
  caption: text("caption"),
  eventId: uuid("event_id").references(() => events.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  approved: boolean("approved").notNull().default(false),
});

export const photosRelations = relations(photos, ({ one }) => ({
  event: one(events, {
    fields: [photos.eventId],
    references: [events.id],
  }),
}));

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
