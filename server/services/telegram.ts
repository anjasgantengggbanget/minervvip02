import TelegramBot from 'node-telegram-bot-api';
import { storage } from '../storage';
import { generateReferralCode } from '../utils';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';

if (!BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN not found in environment variables');
}

export class TelegramService {
  private bot: TelegramBot | null = null;

  constructor() {
    if (BOT_TOKEN) {
      this.bot = new TelegramBot(BOT_TOKEN, { polling: true });
      this.setupCommands();
    }
  }

  private setupCommands() {
    if (!this.bot) return;

    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (text === '/start') {
        await this.handleStart(msg);
      }
    });

    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });
  }

  private async handleStart(msg: any) {
    if (!this.bot) return;

    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || '';
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Extract referral code from start parameter
    const startParam = msg.text.split(' ')[1];
    let referredBy = null;

    if (startParam) {
      const referrer = await storage.getUserByTelegramId(startParam);
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Check if user exists
    let user = await storage.getUserByTelegramId(telegramId);

    if (!user) {
      // Create new user
      const referralCode = generateReferralCode();
      user = await storage.createUser({
        telegramId,
        telegramUsername: username,
        telegramName: fullName,
        referralCode,
        referredBy,
        balance: '0.00',
        miningRate: '0.05',
        farmingActive: false,
        totalEarnings: '0.00',
        referralEarnings: '0.00',
        level: 1,
        isAdmin: false,
      });

      // Create referral relationships if referred
      if (referredBy) {
        await this.createReferralChain(user.id, referredBy);
      }
    }

    // Send welcome message with inline keyboard
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 Open Mining Bot',
            web_app: { url: process.env.WEBAPP_URL || 'https://your-app-url.com' }
          }
        ]
      ]
    };

    await this.bot.sendMessage(
      chatId,
      `Welcome to USDT Mining Bot! 🎉\n\n` +
      `💰 Start earning USDT by mining\n` +
      `🎯 Complete daily tasks\n` +
      `👥 Invite friends and earn referral bonuses\n` +
      `🚀 Upgrade your mining power\n\n` +
      `Click the button below to start mining!`,
      { reply_markup: keyboard }
    );
  }

  private async createReferralChain(userId: number, referrerId: number) {
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

  private async handleCallbackQuery(query: any) {
    if (!this.bot) return;

    const chatId = query.message.chat.id;
    const data = query.data;

    // Handle different callback queries
    switch (data) {
      case 'start_mining':
        await this.bot.sendMessage(chatId, 'Mining started! Open the web app to track your progress.');
        break;
      default:
        break;
    }

    await this.bot.answerCallbackQuery(query.id);
  }

  async sendNotification(telegramId: string, message: string) {
    if (!this.bot) return;

    try {
      await this.bot.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Failed to send telegram notification:', error);
    }
  }

  async authenticateUser(telegramId: string): Promise<any> {
    const user = await storage.getUserByTelegramId(telegramId);
    return user;
  }
}

export const telegramService = new TelegramService();
