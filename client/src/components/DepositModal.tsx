import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, InfoIcon } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [depositWallet, setDepositWallet] = useState('');
  const { toast } = useToast();

  const initiateMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await apiRequest('POST', '/api/deposit/initiate', { amount });
      return response.json();
    },
    onSuccess: (data) => {
      setDepositWallet(data.depositWallet);
      toast({
        title: "Deposit Initiated",
        description: `Send ${amount} SOL to the provided address`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(depositWallet);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleInitiate = () => {
    if (!amount || parseFloat(amount) < 0.05) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit is 0.05 SOL",
        variant: "destructive",
      });
      return;
    }
    
    initiateMutation.mutate(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="crypto-card border border-gray-700 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Deposit Solana</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Amount (SOL)</label>
            <Input
              type="number"
              placeholder="0.05"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-crypto-dark text-white border-gray-600 focus:border-crypto-accent"
            />
            <div className="text-xs text-gray-400 mt-1">Minimum: 0.05 SOL</div>
          </div>

          {!depositWallet ? (
            <Button
              onClick={handleInitiate}
              disabled={initiateMutation.isPending}
              className="w-full crypto-button text-white font-semibold py-2 px-4 rounded-lg"
            >
              {initiateMutation.isPending ? 'Processing...' : 'Get Deposit Address'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-crypto-dark rounded-lg p-4 border border-gray-600">
                <div className="text-xs text-gray-400 mb-2">Send {amount} SOL to this address:</div>
                <div className="text-xs text-crypto-accent break-all bg-gray-800 p-2 rounded mb-2">
                  {depositWallet}
                </div>
                <Button
                  onClick={copyAddress}
                  size="sm"
                  className="bg-crypto-accent text-crypto-dark hover:bg-opacity-80"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Address
                </Button>
              </div>
              
              <div className="flex items-start space-x-2 text-xs text-gray-400">
                <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  Deposits are processed automatically and usually take 1-3 minutes.
                </div>
              </div>
              
              <Button
                onClick={onClose}
                className="w-full bg-crypto-blue text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-80"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
