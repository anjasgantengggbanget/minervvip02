import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { telegramService } from "./services/telegram";
import { solanaService } from "./services/solana";
import { insertTransactionSchema, type User } from "@shared/schema";
import jwt from 'jsonwebtoken';

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
      adminId?: number;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware for admin authentication
const adminAuth = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.adminId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware for user authentication
const userAuth = async (req: Request, res: Response, next: any) => {
  const telegramId = req.headers['x-telegram-id'] as string;
  
  if (!telegramId) {
    return res.status(401).json({ message: 'Telegram ID required' });
  }

  try {
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/telegram', async (req, res) => {
    try {
      const { telegramId, telegramUsername, telegramName, referralCode } = req.body;
      
      let user = await storage.getUserByTelegramId(telegramId);
      
      if (!user) {
        // Create new user
        const newReferralCode = generateReferralCode();
        let referredBy = null;
        
        if (referralCode) {
          const referrer = await storage.getUserByTelegramId(referralCode);
          if (referrer) {
            referredBy = referrer.id;
          }
        }
        
        user = await storage.createUser({
          telegramId,
          telegramUsername,
          telegramName,
          referralCode: newReferralCode,
          referredBy,
          balance: '0.00',
          miningRate: '0.05',
          farmingActive: false,
          totalEarnings: '0.00',
          referralEarnings: '0.00',
          level: 1,
          isAdmin: false,
        });

        // Create referral chain if referred
        if (referredBy) {
          await createReferralChain(user.id, referredBy);
        }
      }

      res.json({ user, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // Auto-create demo user for testing
  app.post('/api/auth/demo', async (req, res) => {
    try {
      const demoTelegramId = 'demo_user_123456789';
      let user = await storage.getUserByTelegramId(demoTelegramId);
      
      if (!user) {
        user = await storage.createUser({
          telegramId: demoTelegramId,
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
        });
      }
      
      res.json({ user, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Demo user creation failed' });
    }
  });

  // Secure admin access endpoint - only accessible via direct URL
  app.post('/api/secure/admin/auth/9f8a3b2c7d1e5f4g6h8i9j0k', async (req, res) => {
    try {
      const { password } = req.body;
      
      const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin2024!';
      
      if (password !== adminPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: 0, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Admin authentication failed' });
    }
  });

  // User routes
  app.get('/api/user/profile', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const referralStats = await storage.getReferralStats(user.id);
      
      res.json({
        user,
        referralStats,
        success: true
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.post('/api/user/start-farming', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      // Check if farming is already active
      if (user.farmingActive) {
        return res.status(400).json({ message: 'Farming already active' });
      }

      // Start farming
      await storage.updateUser(user.id, {
        farmingActive: true,
        lastFarmingClaim: new Date()
      });

      res.json({ success: true, message: 'Farming started' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to start farming' });
    }
  });

  app.post('/api/user/claim-farming', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      if (!user.farmingActive || !user.lastFarmingClaim) {
        return res.status(400).json({ message: 'No active farming session' });
      }

      const now = new Date();
      const lastClaim = new Date(user.lastFarmingClaim);
      const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastClaim < 1) {
        return res.status(400).json({ message: 'Too early to claim' });
      }

      const hoursToReward = Math.min(Math.floor(hoursSinceLastClaim), 24);
      const miningRate = parseFloat(user.miningRate || '0.05');
      const reward = hoursToReward * miningRate;

      // Update user balance
      const newBalance = parseFloat(user.balance || '0') + reward;
      const newTotalEarnings = parseFloat(user.totalEarnings || '0') + reward;

      await storage.updateUser(user.id, {
        balance: newBalance.toFixed(2),
        totalEarnings: newTotalEarnings.toFixed(2),
        lastFarmingClaim: now,
        farmingActive: false
      });

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: 'farming',
        amount: reward.toFixed(2),
        status: 'completed',
        description: `Farming reward for ${hoursToReward} hours`
      });

      res.json({ 
        success: true, 
        reward: reward.toFixed(2), 
        newBalance: newBalance.toFixed(2) 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to claim farming reward' });
    }
  });

  // Tasks routes
  app.get('/api/tasks', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const allTasks = await storage.getAllTasks();
      const userTasks = await storage.getUserTasks(user.id);
      
      const tasksWithStatus = allTasks.map(task => {
        const userTask = userTasks.find(ut => ut.taskId === task.id);
        return {
          ...task,
          completed: userTask?.completed || false,
          completedAt: userTask?.completedAt
        };
      });

      res.json({ tasks: tasksWithStatus, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks/:taskId/complete', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const taskId = parseInt(req.params.taskId);
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if user already completed this task
      const userTasks = await storage.getUserTasks(user.id);
      const existingTask = userTasks.find(ut => ut.taskId === taskId);
      
      if (existingTask && existingTask.completed) {
        return res.status(400).json({ message: 'Task already completed' });
      }

      // Complete the task
      if (existingTask) {
        await storage.completeUserTask(user.id, taskId);
      } else {
        await storage.createUserTask({ userId: user.id, taskId });
        await storage.completeUserTask(user.id, taskId);
      }

      // Reward user
      const reward = parseFloat(task.reward || '0');
      const newBalance = parseFloat(user.balance || '0') + reward;
      const newTotalEarnings = parseFloat(user.totalEarnings || '0') + reward;

      await storage.updateUser(user.id, {
        balance: newBalance.toFixed(2),
        totalEarnings: newTotalEarnings.toFixed(2)
      });

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: 'task',
        amount: reward.toFixed(2),
        status: 'completed',
        description: `Task completed: ${task.title}`
      });

      res.json({ 
        success: true, 
        reward: reward.toFixed(2), 
        newBalance: newBalance.toFixed(2) 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to complete task' });
    }
  });

  // Boosts routes
  app.get('/api/boosts', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const allBoosts = await storage.getAllBoosts();
      const userBoosts = await storage.getUserBoosts(user.id);
      
      const boostsWithStatus = allBoosts.map(boost => {
        const userBoost = userBoosts.find(ub => ub.boostId === boost.id);
        return {
          ...boost,
          owned: !!userBoost,
          level: userBoost?.level || 0
        };
      });

      res.json({ boosts: boostsWithStatus, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch boosts' });
    }
  });

  app.post('/api/boosts/:boostId/purchase', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const boostId = parseInt(req.params.boostId);
      
      const boost = await storage.getBoost(boostId);
      if (!boost) {
        return res.status(404).json({ message: 'Boost not found' });
      }

      const cost = parseFloat(boost.cost || '0');
      const userBalance = parseFloat(user.balance || '0');

      if (userBalance < cost) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Purchase boost
      await storage.createUserBoost({ userId: user.id, boostId });

      // Deduct cost from balance
      const newBalance = userBalance - cost;
      await storage.updateUser(user.id, {
        balance: newBalance.toFixed(2)
      });

      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: 'boost',
        amount: (-cost).toFixed(2),
        status: 'completed',
        description: `Purchased boost: ${boost.name}`
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2) 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to purchase boost' });
    }
  });

  // Daily combo routes
  app.get('/api/daily-combo', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const combo = await storage.getTodayCombo();
      
      if (!combo) {
        return res.json({ combo: null, success: true });
      }

      const userCombo = await storage.getUserDailyCombo(user.id, combo.id);
      
      res.json({ 
        combo: {
          ...combo,
          completed: userCombo?.completed || false
        }, 
        success: true 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch daily combo' });
    }
  });

  // Transactions routes
  app.get('/api/transactions', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const transactions = await storage.getTransactionsByUserId(user.id);
      
      res.json({ transactions, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  // Deposit routes
  app.post('/api/deposit/initiate', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { amount } = req.body;
      
      const solAmount = parseFloat(amount);
      const minDeposit = await solanaService.getMinimumDeposit();
      
      if (solAmount < minDeposit) {
        return res.status(400).json({ 
          message: `Minimum deposit is ${minDeposit} SOL` 
        });
      }

      const depositWallet = await solanaService.getDepositWallet();
      
      // Create pending transaction
      await storage.createTransaction({
        userId: user.id,
        type: 'deposit',
        amount: solAmount.toFixed(2),
        status: 'pending',
        walletAddress: depositWallet,
        description: `SOL deposit of ${solAmount} SOL`
      });

      res.json({ 
        depositWallet, 
        amount: solAmount, 
        success: true 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to initiate deposit' });
    }
  });

  // Withdrawal routes
  app.post('/api/withdraw/initiate', userAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { amount, walletAddress } = req.body;
      
      const withdrawAmount = parseFloat(amount);
      const userBalance = parseFloat(user.balance || '0');
      
      if (withdrawAmount < 10) {
        return res.status(400).json({ 
          message: 'Minimum withdrawal is $10' 
        });
      }

      if (withdrawAmount > userBalance) {
        return res.status(400).json({ 
          message: 'Insufficient balance' 
        });
      }

      // Create pending withdrawal
      await storage.createTransaction({
        userId: user.id,
        type: 'withdrawal',
        amount: withdrawAmount.toFixed(2),
        status: 'pending',
        walletAddress,
        description: `USDT withdrawal of $${withdrawAmount}`
      });

      res.json({ 
        success: true, 
        message: 'Withdrawal request submitted' 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to initiate withdrawal' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', adminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const transactions = await storage.getAllTransactions();
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.farmingActive).length;
      const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);
      const totalWithdrawals = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'completed')
        .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0);

      res.json({
        totalUsers,
        activeUsers,
        totalDeposits: totalDeposits.toFixed(2),
        totalWithdrawals: totalWithdrawals.toFixed(2),
        success: true
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ users, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/transactions', adminAuth, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json({ transactions, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/admin/tasks', adminAuth, async (req, res) => {
    try {
      const task = await storage.createTask(req.body);
      res.json({ task, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.put('/api/admin/tasks/:taskId', adminAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.updateTask(taskId, req.body);
      res.json({ task, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/admin/tasks/:taskId', adminAuth, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      await storage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  app.post('/api/admin/boosts', adminAuth, async (req, res) => {
    try {
      const boost = await storage.createBoost(req.body);
      res.json({ boost, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create boost' });
    }
  });

  app.get('/api/admin/settings', adminAuth, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ settings, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.put('/api/admin/settings/:key', adminAuth, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const setting = await storage.setSetting(key, value);
      res.json({ setting, success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update setting' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createReferralChain(userId: number, referrerId: number) {
  // Level 1 referral (direct)
  await storage.createReferral({
    referrerId,
    referredId: userId,
    level: 1,
    commission: '10.00'
  });

  // Level 2 referral (referrer's referrer)
  const referrer = await storage.getUser(referrerId);
  if (referrer && referrer.referredBy) {
    await storage.createReferral({
      referrerId: referrer.referredBy,
      referredId: userId,
      level: 2,
      commission: '5.00'
    });

    // Level 3 referral (referrer's referrer's referrer)
    const level2Referrer = await storage.getUser(referrer.referredBy);
    if (level2Referrer && level2Referrer.referredBy) {
      await storage.createReferral({
        referrerId: level2Referrer.referredBy,
        referredId: userId,
        level: 3,
        commission: '2.00'
      });
    }
  }
}
