import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pickaxe, Play, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  farmingActive: boolean;
  lastFarmingClaim?: string;
  miningRate: string;
  balance: string;
}

interface MiningSectionProps {
  user: User;
  onRefresh: () => void;
}

export default function MiningSection({ user, onRefresh }: MiningSectionProps) {
  const [farmingProgress, setFarmingProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const { toast } = useToast();

  // Calculate farming progress and time left
  React.useEffect(() => {
    if (user.farmingActive && user.lastFarmingClaim) {
      const updateProgress = () => {
        const lastClaim = new Date(user.lastFarmingClaim!).getTime();
        const now = new Date().getTime();
        const hoursPassed = (now - lastClaim) / (1000 * 60 * 60);
        const progress = Math.min((hoursPassed / 24) * 100, 100);
        
        setFarmingProgress(progress);
        
        if (progress >= 100) {
          setTimeLeft('Ready to claim!');
        } else {
          const remainingMs = (24 * 60 * 60 * 1000) - (now - lastClaim);
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${remainingHours}h ${remainingMinutes}m remaining`);
        }
      };

      updateProgress();
      const interval = setInterval(updateProgress, 60000); // Update every minute
      return () => clearInterval(interval);
    } else {
      setFarmingProgress(0);
      setTimeLeft('');
    }
  }, [user.farmingActive, user.lastFarmingClaim]);

  const startFarmingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/user/start-farming');
    },
    onSuccess: () => {
      toast({
        title: "Mining Started!",
        description: "You've started mining USDT. Check back in a few hours!",
      });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const claimFarmingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/user/claim-farming');
    },
    onSuccess: (data: any) => {
      toast({
        title: "Reward Claimed!",
        description: `You earned ${data.reward} USDT!`,
      });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleMiningAction = () => {
    if (!user.farmingActive) {
      startFarmingMutation.mutate();
    } else if (farmingProgress >= 100) {
      claimFarmingMutation.mutate();
    }
  };

  return (
    <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-crypto-accent to-crypto-blue rounded-full mx-auto mb-4 flex items-center justify-center">
          <Pickaxe className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Daily Mining</h2>
        <p className="text-gray-400 text-sm">Earn USDT every hour</p>
      </div>
      
      <div className="bg-crypto-dark rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Mining Rate</span>
          <span className="text-crypto-accent font-semibold">
            {user.miningRate} USDT/hour
          </span>
        </div>
        
        {user.farmingActive && (
          <>
            <Progress value={farmingProgress} className="mb-2" />
            <div className="text-xs text-gray-400">{timeLeft}</div>
          </>
        )}
      </div>

      <Button 
        onClick={handleMiningAction}
        disabled={startFarmingMutation.isPending || claimFarmingMutation.isPending}
        className="w-full crypto-button text-white font-semibold py-3 px-6 rounded-lg"
      >
        {startFarmingMutation.isPending || claimFarmingMutation.isPending ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : !user.farmingActive ? (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Mining
          </>
        ) : farmingProgress >= 100 ? (
          <>
            <Trophy className="w-4 h-4 mr-2" />
            Claim Reward
          </>
        ) : (
          <>
            <Pickaxe className="w-4 h-4 mr-2" />
            Mining Active
          </>
        )}
      </Button>
    </div>
  );
}
