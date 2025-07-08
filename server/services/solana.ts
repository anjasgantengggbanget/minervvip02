import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const DEPOSIT_WALLET = process.env.DEPOSIT_WALLET || 'EE9UQfmRtvTHq4TkawiMdqET4gaia32MuEoCwjCuz1cr';

export class SolanaService {
  private connection: Connection;
  private depositWallet: PublicKey;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL);
    this.depositWallet = new PublicKey(DEPOSIT_WALLET);
  }

  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async validateTransaction(signature: string, expectedAmount: number): Promise<boolean> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        return false;
      }

      // Check if transaction is confirmed
      if (transaction.meta?.err) {
        return false;
      }

      // Check if the transaction involves our deposit wallet
      const accountKeys = transaction.transaction.message.accountKeys;
      const depositWalletIndex = accountKeys.findIndex(key => 
        key.toBase58() === this.depositWallet.toBase58()
      );

      if (depositWalletIndex === -1) {
        return false;
      }

      // Check the amount (this is a simplified check)
      const preBalance = transaction.meta?.preBalances?.[depositWalletIndex] || 0;
      const postBalance = transaction.meta?.postBalances?.[depositWalletIndex] || 0;
      const actualAmount = (postBalance - preBalance) / LAMPORTS_PER_SOL;

      return Math.abs(actualAmount - expectedAmount) < 0.001; // Allow small discrepancy
    } catch (error) {
      console.error('Error validating transaction:', error);
      return false;
    }
  }

  async getDepositWallet(): Promise<string> {
    return this.depositWallet.toBase58();
  }

  async convertSolToUsdt(solAmount: number): Promise<number> {
    // This would typically fetch from an API like CoinGecko
    // For demo purposes, using a fixed rate
    const SOL_TO_USDT_RATE = 100; // This should be dynamic in production
    return solAmount * SOL_TO_USDT_RATE;
  }

  async getMinimumDeposit(): Promise<number> {
    return 0.05; // 0.05 SOL minimum
  }
}

export const solanaService = new SolanaService();
