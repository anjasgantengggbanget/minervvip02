import { Home, ListTodo, Rocket, TrendingUp } from "lucide-react";

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ currentTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'boosts', label: 'Boosts', icon: Rocket },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 crypto-card border-t border-gray-700 px-4 py-3">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 ${
                isActive ? 'text-crypto-accent' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
