import { Button } from "@/components/ui/button";
import { Wallet, ArrowDown, ArrowUp } from "lucide-react";

interface WalletSectionProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function WalletSection({ onDeposit, onWithdraw }: WalletSectionProps) {
  return (
    <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Wallet className="w-5 h-5 mr-2 text-crypto-accent" />
        Wallet & Transactions
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Button
          onClick={onDeposit}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
        >
          <ArrowDown className="w-4 h-4 mr-2" />
          Deposit
        </Button>
        <Button
          onClick={onWithdraw}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
      </div>
      
      <div className="bg-crypto-dark rounded-lg p-4">
        <div className="text-sm text-gray-400 mb-2">Solana Wallet</div>
        <div className="text-xs text-crypto-accent break-all">
          EE9UQfmRtvTHq4TkawiMdqET4gaia32MuEoCwjCuz1cr
        </div>
      </div>
    </div>
  );
}
