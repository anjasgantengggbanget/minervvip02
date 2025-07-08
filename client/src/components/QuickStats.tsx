interface User {
  balance: string;
  totalEarnings: string;
  referralEarnings: string;
}

interface ReferralStats {
  level1: number;
  level2: number;
  level3: number;
}

interface QuickStatsProps {
  user: User;
  referralStats: ReferralStats;
}

export default function QuickStats({ user, referralStats }: QuickStatsProps) {
  const todayEarnings = "2.15"; // This would be calculated from today's transactions

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="crypto-card rounded-lg p-4 text-center border border-gray-700">
        <div className="text-crypto-gold text-lg font-bold">${todayEarnings}</div>
        <div className="text-xs text-gray-400">Today</div>
      </div>
      <div className="crypto-card rounded-lg p-4 text-center border border-gray-700">
        <div className="text-crypto-accent text-lg font-bold">${user.totalEarnings}</div>
        <div className="text-xs text-gray-400">Total</div>
      </div>
      <div className="crypto-card rounded-lg p-4 text-center border border-gray-700">
        <div className="text-crypto-blue text-lg font-bold">
          {referralStats.level1 + referralStats.level2 + referralStats.level3}
        </div>
        <div className="text-xs text-gray-400">Referrals</div>
      </div>
    </div>
  );
}
