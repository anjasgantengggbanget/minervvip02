import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(),
  telegramUsername: text("telegram_username"),
  telegramName: text("telegram_name"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  miningRate: decimal("mining_rate", { precision: 10, scale: 4 }).default("0.05"),
  lastFarmingClaim: timestamp("last_farming_claim"),
  farmingActive: boolean("farming_active").default(false),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  referralEarnings: decimal("referral_earnings", { precision: 10, scale: 2 }).default("0.00"),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  isAdmin: boolean("is_admin").default(false),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull(),
  referredId: integer("referred_id").notNull(),
  level: integer("level").notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  taskType: text("task_type").notNull(), // 'telegram', 'twitter', 'youtube', etc.
  taskUrl: text("task_url"),
  iconClass: text("icon_class"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const boosts = pgTable("boosts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  multiplier: decimal("multiplier", { precision: 5, scale: 2 }).notNull(),
  iconClass: text("icon_class"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBoosts = pgTable("user_boosts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  boostId: integer("boost_id").notNull(),
  level: integer("level").default(1),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

export const dailyCombo = pgTable("daily_combo", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  requiredBoosts: jsonb("required_boosts").notNull(), // array of boost IDs
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const userDailyCombo = pgTable("user_daily_combo", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  comboId: integer("combo_id").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'farming', 'referral', 'task', 'boost'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  transactionHash: text("transaction_hash"),
  walletAddress: text("wallet_address"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  referrals: many(referrals, { relationName: "referrer" }),
  referredUsers: many(referrals, { relationName: "referred" }),
  referredBy: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
  userTasks: many(userTasks),
  userBoosts: many(userBoosts),
  userDailyCombo: many(userDailyCombo),
  transactions: many(transactions),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

export const boostsRelations = relations(boosts, ({ many }) => ({
  userBoosts: many(userBoosts),
}));

export const userBoostsRelations = relations(userBoosts, ({ one }) => ({
  user: one(users, {
    fields: [userBoosts.userId],
    references: [users.id],
  }),
  boost: one(boosts, {
    fields: [userBoosts.boostId],
    references: [boosts.id],
  }),
}));

export const dailyComboRelations = relations(dailyCombo, ({ many }) => ({
  userDailyCombo: many(userDailyCombo),
}));

export const userDailyComboRelations = relations(userDailyCombo, ({ one }) => ({
  user: one(users, {
    fields: [userDailyCombo.userId],
    references: [users.id],
  }),
  combo: one(dailyCombo, {
    fields: [userDailyCombo.comboId],
    references: [dailyCombo.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertBoostSchema = createInsertSchema(boosts).omit({
  id: true,
  createdAt: true,
});

export const insertUserBoostSchema = createInsertSchema(userBoosts).omit({
  id: true,
  purchasedAt: true,
});

export const insertDailyComboSchema = createInsertSchema(dailyCombo).omit({
  id: true,
});

export const insertUserDailyComboSchema = createInsertSchema(userDailyCombo).omit({
  id: true,
  completedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Boost = typeof boosts.$inferSelect;
export type InsertBoost = z.infer<typeof insertBoostSchema>;
export type UserBoost = typeof userBoosts.$inferSelect;
export type InsertUserBoost = z.infer<typeof insertUserBoostSchema>;
export type DailyCombo = typeof dailyCombo.$inferSelect;
export type InsertDailyCombo = z.infer<typeof insertDailyComboSchema>;
export type UserDailyCombo = typeof userDailyCombo.$inferSelect;
export type InsertUserDailyCombo = z.infer<typeof insertUserDailyComboSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
