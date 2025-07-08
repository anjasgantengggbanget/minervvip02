import { db } from './db';
import { users, tasks, boosts, dailyCombo, settings } from '@shared/schema';
import { generateReferralCode } from './utils';
import { eq } from 'drizzle-orm';

export async function initializeDatabase() {
  try {
    // Create demo tasks
    const defaultTasks = [
      {
        title: "Join @MinerUSdt_bot",
        description: "Subscribe to our main Telegram channel",
        reward: "2.50",
        taskType: "telegram",
        taskUrl: "https://t.me/MinerUSdt_bot",
        iconClass: "telegram",
        isActive: true
      },
      {
        title: "Follow on Twitter",
        description: "Follow our official Twitter account",
        reward: "1.50",
        taskType: "twitter",
        taskUrl: "https://twitter.com/minerusdt",
        iconClass: "twitter",
        isActive: true
      },
      {
        title: "Subscribe to YouTube",
        description: "Subscribe to our YouTube channel",
        reward: "3.00",
        taskType: "youtube",
        taskUrl: "https://youtube.com/minerusdt",
        iconClass: "youtube",
        isActive: true
      },
      {
        title: "Join Mining Community",
        description: "Join our mining discussion group",
        reward: "2.00",
        taskType: "telegram",
        taskUrl: "https://t.me/minerusdt_community",
        iconClass: "telegram",
        isActive: true
      },
      {
        title: "Daily Check-in",
        description: "Complete your daily check-in",
        reward: "1.00",
        taskType: "daily",
        taskUrl: "",
        iconClass: "calendar",
        isActive: true
      }
    ];

    // Create demo boosts
    const defaultBoosts = [
      {
        name: "Mining Speed x2",
        description: "Double your mining speed for 24 hours",
        cost: "10.00",
        multiplier: "2.0",
        iconClass: "zap",
        isActive: true
      },
      {
        name: "Mining Speed x3",
        description: "Triple your mining speed for 24 hours",
        cost: "25.00",
        multiplier: "3.0",
        iconClass: "zap",
        isActive: true
      },
      {
        name: "Auto-Claim",
        description: "Automatically claim mining rewards",
        cost: "50.00",
        multiplier: "1.0",
        iconClass: "robot",
        isActive: true
      },
      {
        name: "Energy Boost",
        description: "Increase mining capacity by 50%",
        cost: "15.00",
        multiplier: "1.5",
        iconClass: "battery",
        isActive: true
      }
    ];

    // Create today's combo
    const todayCombo = {
      combo: ["Mining Speed x2", "Energy Boost", "Auto-Claim"],
      reward: "100.00",
      date: new Date().toISOString().split('T')[0]
    };

    // Create demo user
    const demoUser = {
      telegramId: 'demo_user_123456789',
      telegramUsername: 'demouser',
      telegramName: 'Demo User',
      referralCode: generateReferralCode(),
      referredBy: null,
      balance: '15.50',
      miningRate: '0.12',
      farmingActive: false,
      totalEarnings: '45.75',
      referralEarnings: '8.25',
      level: 3,
      isAdmin: false,
    };

    // Insert data
    const existingTasks = await db.select().from(tasks);
    if (existingTasks.length === 0) {
      await db.insert(tasks).values(defaultTasks);
    }

    const existingBoosts = await db.select().from(boosts);
    if (existingBoosts.length === 0) {
      await db.insert(boosts).values(defaultBoosts);
    }

    const existingCombo = await db.select().from(dailyCombo);
    if (existingCombo.length === 0) {
      await db.insert(dailyCombo).values(todayCombo);
    }

    const existingUser = await db.select().from(users).where(eq(users.telegramId, demoUser.telegramId));
    if (existingUser.length === 0) {
      await db.insert(users).values(demoUser);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}