import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Puzzle, Bolt, Zap, Rocket } from "lucide-react";

interface User {
  id: number;
}

interface DailyComboProps {
  user: User;
  onRefresh: () => void;
}

export default function DailyCombo({ user, onRefresh }: DailyComboProps) {
  const { data: comboData, isLoading } = useQuery({
    queryKey: ['/api/daily-combo'],
    queryFn: async () => {
      const telegramId = getTelegramId();
      const response = await fetch('/api/daily-combo', {
        headers: {
          'X-Telegram-Id': telegramId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch daily combo');
      return response.json();
    }
  });

  // Helper function to get telegram ID (same as in home.tsx)
  function getTelegramId(): string {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
    return 'demo_user_123456789';
  }

  const combo = comboData?.combo;

  if (isLoading) {
    return (
      <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4"></div>
          <div className="h-12 bg-gray-600 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
          </div>
          <div className="h-10 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Puzzle className="w-5 h-5 mr-2 text-crypto-gold" />
        Daily Combo
      </h3>
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-crypto-gold">
          {combo ? `+${combo.reward} USDT` : '+5.0 USDT'}
        </div>
        <div className="text-sm text-gray-400">Complete 3 upgrades</div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-crypto-dark rounded-lg p-3 text-center border-2 border-crypto-accent">
          <Bolt className="w-6 h-6 text-crypto-accent mx-auto mb-1" />
          <div className="text-xs">Speed</div>
        </div>
        <div className="bg-crypto-dark rounded-lg p-3 text-center border-2 border-gray-600">
          <div className="w-6 h-6 text-gray-400 mx-auto mb-1 flex items-center justify-center">
            <i className="fas fa-question text-lg" />
          </div>
          <div className="text-xs text-gray-400">???</div>
        </div>
        <div className="bg-crypto-dark rounded-lg p-3 text-center border-2 border-gray-600">
          <div className="w-6 h-6 text-gray-400 mx-auto mb-1 flex items-center justify-center">
            <i className="fas fa-question text-lg" />
          </div>
          <div className="text-xs text-gray-400">???</div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-crypto-gold text-crypto-dark font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80"
        onClick={() => {
          // Navigate to upgrades/boosts section
          // This would typically change the current tab
        }}
      >
        <Rocket className="w-4 h-4 mr-2" />
        View Upgrades
      </Button>
    </div>
  );
}
