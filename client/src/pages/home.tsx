import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MiningSection from "@/components/MiningSection";
import QuickStats from "@/components/QuickStats";
import DailyTasks from "@/components/DailyTasks";
import DailyCombo from "@/components/DailyCombo";
import ReferralSystem from "@/components/ReferralSystem";
import WalletSection from "@/components/WalletSection";
import BottomNavigation from "@/components/BottomNavigation";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import { Coins } from "lucide-react";

interface User {
  id: number;
  telegramId: string;
  telegramUsername?: string;
  telegramName?: string;
  balance: string;
  miningRate: string;
  farmingActive: boolean;
  lastFarmingClaim?: string;
  totalEarnings: string;
  referralEarnings: string;
  referralCode: string;
  level: number;
}

interface ReferralStats {
  level1: number;
  level2: number;
  level3: number;
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState('home');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const telegramId = getTelegramId();
      
      // First try to create/get demo user
      if (telegramId === 'demo_user_123456789') {
        await fetch('/api/auth/demo', { method: 'POST' });
      }
      
      const response = await fetch('/api/user/profile', {
        headers: {
          'X-Telegram-Id': telegramId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  const user: User = profileData?.user;
  const referralStats: ReferralStats = profileData?.referralStats || { level1: 0, level2: 0, level3: 0 };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-crypto-accent to-crypto-blue rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-400 mb-4">Authentication Required</h1>
          <p className="text-gray-400">Please access this bot through Telegram</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      {/* Navigation Header */}
      <div className="crypto-card border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-crypto-accent rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-crypto-dark" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">USDT Mining Bot</h1>
              <p className="text-xs text-gray-400">@{user.telegramUsername || 'unknown'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-crypto-accent">${user.balance}</div>
            <div className="text-xs text-gray-400">Available Balance</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-md pb-20">
        {currentTab === 'home' && (
          <>
            <MiningSection user={user} onRefresh={refetch} />
            <QuickStats user={user} referralStats={referralStats} />
            <DailyTasks user={user} onRefresh={refetch} />
            <DailyCombo user={user} onRefresh={refetch} />
            <ReferralSystem user={user} referralStats={referralStats} />
            <WalletSection 
              onDeposit={() => setShowDepositModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
            />
          </>
        )}

        {currentTab === 'tasks' && (
          <DailyTasks user={user} onRefresh={refetch} />
        )}

        {currentTab === 'boosts' && (
          <div className="crypto-card rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Boost Your Mining</h2>
            <p className="text-gray-400">Coming soon...</p>
          </div>
        )}

        {currentTab === 'stats' && (
          <div className="space-y-6">
            <QuickStats user={user} referralStats={referralStats} />
            <div className="crypto-card rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Your Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Mining Rate</span>
                  <span className="text-crypto-accent">{user.miningRate} USDT/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Earnings</span>
                  <span className="text-crypto-gold">${user.totalEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Referral Earnings</span>
                  <span className="text-crypto-blue">${user.referralEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className="text-white">{user.level}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <DepositModal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      
      <WithdrawModal 
        isOpen={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
        balance={user.balance}
      />
    </div>
  );
}

function getTelegramId(): string {
  // In a real Telegram WebApp, this would come from window.Telegram.WebApp.initDataUnsafe.user.id
  // For demo purposes, we'll check if we have Telegram WebApp available
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
    return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
  }
  // Demo mode - create a unique demo user
  return 'demo_user_123456789';
}
