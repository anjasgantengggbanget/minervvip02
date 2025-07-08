import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { CheckCircle, ExternalLink } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string;
  reward: string;
  taskType: string;
  taskUrl?: string;
  iconClass?: string;
  completed: boolean;
  completedAt?: string;
}

interface User {
  id: number;
}

interface DailyTasksProps {
  user: User;
  onRefresh: () => void;
}

export default function DailyTasks({ user, onRefresh }: DailyTasksProps) {
  const { toast } = useToast();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const telegramId = getTelegramId();
      const response = await fetch('/api/tasks', {
        headers: {
          'X-Telegram-Id': telegramId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
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

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('POST', `/api/tasks/${taskId}/complete`);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Task Completed!",
        description: `You earned ${data.reward} USDT!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
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

  const getTaskIcon = (taskType: string, iconClass?: string) => {
    if (iconClass) return <i className={`${iconClass} text-sm`} />;
    
    switch (taskType) {
      case 'telegram':
        return <i className="fab fa-telegram text-sm" />;
      case 'twitter':
        return <i className="fab fa-twitter text-sm" />;
      case 'youtube':
        return <i className="fab fa-youtube text-sm" />;
      default:
        return <i className="fas fa-tasks text-sm" />;
    }
  };

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'telegram':
        return 'bg-crypto-blue';
      case 'twitter':
        return 'bg-purple-500';
      case 'youtube':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleTaskAction = (task: Task) => {
    if (task.taskUrl) {
      window.open(task.taskUrl, '_blank');
    }
    
    if (!task.completed) {
      completeTaskMutation.mutate(task.id);
    }
  };

  if (isLoading) {
    return (
      <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const tasks: Task[] = tasksData?.tasks || [];

  return (
    <div className="crypto-card rounded-xl p-6 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-tasks mr-2 text-crypto-accent" />
        Daily Tasks
      </h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getTaskColor(task.taskType)} rounded-full flex items-center justify-center`}>
                {getTaskIcon(task.taskType, task.iconClass)}
              </div>
              <div>
                <div className="text-sm font-medium">{task.title}</div>
                <div className="text-xs text-crypto-accent">+{task.reward} USDT</div>
              </div>
            </div>
            
            <div>
              {task.completed ? (
                <div className="text-green-400 text-xs flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Done
                </div>
              ) : (
                <Button
                  onClick={() => handleTaskAction(task)}
                  disabled={completeTaskMutation.isPending}
                  size="sm"
                  className="bg-crypto-accent text-crypto-dark hover:bg-opacity-80"
                >
                  {task.taskUrl ? (
                    <>
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
