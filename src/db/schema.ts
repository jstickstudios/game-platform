import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  index,
  bigint,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull(),
    email: text("email"),
    passwordHash: text("password_hash").notNull(),
    isFounder: boolean("is_founder").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_username_idx").on(t.username)],
);

// NOTE: only the game, the amount and the payment provider's reference id are
// stored. Card numbers / bank details are never sent to or saved by this app.
export const purchases = pgTable(
  "purchases",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug").notNull(),
    provider: text("provider").notNull(),
    providerRef: text("provider_ref"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("eur"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("purchases_user_game_idx").on(t.userId, t.gameSlug)],
);

export const gameScores = pgTable(
  "game_scores",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameSlug: text("game_slug").notNull(),
    score: bigint("score", { mode: "number" }).notNull(),
    details: jsonb("details").notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("game_scores_user_game_idx").on(t.userId, t.gameSlug),
    index("game_scores_leaderboard_idx").on(t.gameSlug, t.score),
  ],
);
