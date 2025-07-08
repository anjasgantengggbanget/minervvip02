import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy } from "lucide-react";
import { useState } from "react";

interface User {
  id: number;
  referralCode: string;
  referralEarnings: string;
}

interface ReferralStats {
  level1: number;
  level2: number;
  level3: number;
}

interface ReferralSystemProps {
  user: User;
  referralStats: ReferralStats;
}

export default function ReferralSystem({ user, referralStats }: ReferralSystemProps) {
  const [referralLink] = useState(`https://t.me/USDTMiningBot?start=${user.referralCode}`);
  const { toast } = useToast();

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-crypto-blue" />
        Referral System
      </h3>
      
      <div className="bg-crypto-dark rounded-lg p-4 mb-4">
        <div className="text-sm text-gray-400 mb-2">Your referral link:</div>
        <div className="flex items-center space-x-2">
          <Input
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-md text-xs border-gray-600"
          />
          <Button
            onClick={copyReferralLink}
            size="sm"
            className="bg-crypto-accent text-crypto-dark hover:bg-opacity-80"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-crypto-blue">{referralStats.level1}</div>
          <div className="text-xs text-gray-400">Level 1 (10%)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-crypto-blue">{referralStats.level2}</div>
          <div className="text-xs text-gray-400">Level 2 (5%)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-crypto-blue">{referralStats.level3}</div>
          <div className="text-xs text-gray-400">Level 3 (2%)</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-400">Total Referral Earnings</div>
        <div className="text-xl font-bold text-crypto-accent">${user.referralEarnings}</div>
      </div>
    </div>
  );
}
