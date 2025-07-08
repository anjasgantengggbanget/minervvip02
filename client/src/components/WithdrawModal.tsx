import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowUp, InfoIcon } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
}

export default function WithdrawModal({ isOpen, onClose, balance }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const { toast } = useToast();

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, walletAddress }: { amount: string; walletAddress: string }) => {
      const response = await apiRequest('POST', '/api/withdraw/initiate', { amount, walletAddress });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Submitted",
        description: "Your withdrawal request has been submitted for processing",
      });
      onClose();
      setAmount('');
      setWalletAddress('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) < 10) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal is $10.00",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Wallet Address Required",
        description: "Please enter your Solana wallet address",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount, walletAddress });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="crypto-card border border-gray-700 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Withdraw USDT</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Available: ${balance}</div>
            <div className="text-sm text-gray-400 mb-2">Minimum withdrawal: $10.00</div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Amount (USD)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-crypto-dark text-white border-gray-600 focus:border-crypto-accent"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Solana Wallet Address</label>
            <Input
              type="text"
              placeholder="Solana wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="bg-crypto-dark text-white border-gray-600 focus:border-crypto-accent"
            />
          </div>

          <div className="flex items-start space-x-2 text-xs text-gray-400">
            <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              Withdrawals are processed within 24 hours. Fee: 2%
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={withdrawMutation.isPending}
            className="w-full bg-red-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            {withdrawMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <ArrowUp className="w-4 h-4 mr-2" />
                Withdraw
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
