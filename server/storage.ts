import { 
  users, 
  referrals, 
  tasks, 
  userTasks, 
  boosts, 
  userBoosts, 
  dailyCombo, 
  userDailyCombo, 
  transactions, 
  settings,
  type User, 
  type InsertUser,
  type Referral,
  type InsertReferral,
  type Task,
  type InsertTask,
  type UserTask,
  type InsertUserTask,
  type Boost,
  type InsertBoost,
  type UserBoost,
  type InsertUserBoost,
  type DailyCombo,
  type InsertDailyCombo,
  type UserDailyCombo,
  type InsertUserDailyCombo,
  type Transaction,
  type InsertTransaction,
  type Setting,
  type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByUserId(userId: number): Promise<Referral[]>;
  getReferralStats(userId: number): Promise<{level1: number, level2: number, level3: number}>;

  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // User Tasks
  getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  completeUserTask(userId: number, taskId: number): Promise<UserTask>;

  // Boosts
  getAllBoosts(): Promise<Boost[]>;
  getBoost(id: number): Promise<Boost | undefined>;
  createBoost(boost: InsertBoost): Promise<Boost>;
  updateBoost(id: number, boost: Partial<InsertBoost>): Promise<Boost>;
  deleteBoost(id: number): Promise<void>;

  // User Boosts
  getUserBoosts(userId: number): Promise<(UserBoost & { boost: Boost })[]>;
  createUserBoost(userBoost: InsertUserBoost): Promise<UserBoost>;

  // Daily Combo
  getTodayCombo(): Promise<DailyCombo | undefined>;
  createDailyCombo(combo: InsertDailyCombo): Promise<DailyCombo>;
  getUserDailyCombo(userId: number, comboId: number): Promise<UserDailyCombo | undefined>;
  completeUserDailyCombo(userId: number, comboId: number): Promise<UserDailyCombo>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: any): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async getReferralsByUserId(userId: number): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, userId));
  }

  async getReferralStats(userId: number): Promise<{level1: number, level2: number, level3: number}> {
    const stats = await db.select({
      level: referrals.level,
      count: sql<number>`count(*)`.as('count')
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .groupBy(referrals.level);

    const result = { level1: 0, level2: 0, level3: 0 };
    stats.forEach(stat => {
      if (stat.level === 1) result.level1 = Number(stat.count);
      if (stat.level === 2) result.level2 = Number(stat.count);
      if (stat.level === 3) result.level3 = Number(stat.count);
    });

    return result;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.update(tasks).set({ isActive: false }).where(eq(tasks.id, id));
  }

  async getUserTasks(userId: number): Promise<(UserTask & { task: Task })[]> {
    return await db.select()
      .from(userTasks)
      .leftJoin(tasks, eq(userTasks.taskId, tasks.id))
      .where(eq(userTasks.userId, userId))
      .then(rows => rows.map(row => ({
        ...row.user_tasks,
        task: row.tasks!
      })));
  }

  async createUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const [newUserTask] = await db.insert(userTasks).values(userTask).returning();
    return newUserTask;
  }

  async completeUserTask(userId: number, taskId: number): Promise<UserTask> {
    const [completedTask] = await db.update(userTasks)
      .set({ 
        completed: true, 
        completedAt: new Date() 
      })
      .where(and(
        eq(userTasks.userId, userId),
        eq(userTasks.taskId, taskId)
      ))
      .returning();
    return completedTask;
  }

  async getAllBoosts(): Promise<Boost[]> {
    return await db.select().from(boosts).where(eq(boosts.isActive, true));
  }

  async getBoost(id: number): Promise<Boost | undefined> {
    const [boost] = await db.select().from(boosts).where(eq(boosts.id, id));
    return boost || undefined;
  }

  async createBoost(boost: InsertBoost): Promise<Boost> {
    const [newBoost] = await db.insert(boosts).values(boost).returning();
    return newBoost;
  }

  async updateBoost(id: number, boost: Partial<InsertBoost>): Promise<Boost> {
    const [updatedBoost] = await db.update(boosts).set(boost).where(eq(boosts.id, id)).returning();
    return updatedBoost;
  }

  async deleteBoost(id: number): Promise<void> {
    await db.update(boosts).set({ isActive: false }).where(eq(boosts.id, id));
  }

  async getUserBoosts(userId: number): Promise<(UserBoost & { boost: Boost })[]> {
    return await db.select()
      .from(userBoosts)
      .leftJoin(boosts, eq(userBoosts.boostId, boosts.id))
      .where(eq(userBoosts.userId, userId))
      .then(rows => rows.map(row => ({
        ...row.user_boosts,
        boost: row.boosts!
      })));
  }

  async createUserBoost(userBoost: InsertUserBoost): Promise<UserBoost> {
    const [newUserBoost] = await db.insert(userBoosts).values(userBoost).returning();
    return newUserBoost;
  }

  async getTodayCombo(): Promise<DailyCombo | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [combo] = await db.select().from(dailyCombo)
      .where(and(
        eq(dailyCombo.date, today),
        eq(dailyCombo.isActive, true)
      ));
    return combo || undefined;
  }

  async createDailyCombo(combo: InsertDailyCombo): Promise<DailyCombo> {
    const [newCombo] = await db.insert(dailyCombo).values(combo).returning();
    return newCombo;
  }

  async getUserDailyCombo(userId: number, comboId: number): Promise<UserDailyCombo | undefined> {
    const [userCombo] = await db.select().from(userDailyCombo)
      .where(and(
        eq(userDailyCombo.userId, userId),
        eq(userDailyCombo.comboId, comboId)
      ));
    return userCombo || undefined;
  }

  async completeUserDailyCombo(userId: number, comboId: number): Promise<UserDailyCombo> {
    const [completedCombo] = await db.update(userDailyCombo)
      .set({ 
        completed: true, 
        completedAt: new Date() 
      })
      .where(and(
        eq(userDailyCombo.userId, userId),
        eq(userDailyCombo.comboId, comboId)
      ))
      .returning();
    return completedCombo;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updatedTransaction] = await db.update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: any): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings)
        .values({ key, value })
        .returning();
      return created;
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }
}

export const storage = new DatabaseStorage();
