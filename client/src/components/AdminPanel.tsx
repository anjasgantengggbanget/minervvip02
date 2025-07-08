import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  DollarSign, 
  ArrowDown, 
  ArrowUp, 
  TrendingUp, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Shield,
  Activity,
  Network,
  ListTodo,
  Rocket,
  BarChart3
} from "lucide-react";

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: string;
  totalWithdrawals: string;
}

interface User {
  id: number;
  telegramId: string;
  telegramUsername?: string;
  telegramName?: string;
  balance: string;
  totalEarnings: string;
  referralEarnings: string;
  level: number;
  farmingActive: boolean;
  createdAt: string;
  isAdmin: boolean;
}

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: string;
  status: string;
  walletAddress?: string;
  description?: string;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  reward: string;
  taskType: string;
  taskUrl?: string;
  iconClass?: string;
  isActive: boolean;
}

interface Boost {
  id: number;
  name: string;
  description?: string;
  cost: string;
  multiplier: string;
  iconClass?: string;
  isActive: boolean;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateBoost, setShowCreateBoost] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingBoost, setEditingBoost] = useState<Boost | null>(null);
  const { toast } = useToast();

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Fetch admin stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        headers: authHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: authHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions', {
        headers: authHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    }
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/admin/tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks', {
        headers: { 'X-Telegram-Id': 'admin' }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });

  // Fetch boosts
  const { data: boostsData, isLoading: boostsLoading } = useQuery({
    queryKey: ['/api/admin/boosts'],
    queryFn: async () => {
      const response = await fetch('/api/boosts', {
        headers: { 'X-Telegram-Id': 'admin' }
      });
      if (!response.ok) throw new Error('Failed to fetch boosts');
      return response.json();
    }
  });

  // Fetch settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings', {
        headers: authHeaders
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Task Created",
        description: "New task has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      setShowCreateTask(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create boost mutation
  const createBoostMutation = useMutation({
    mutationFn: async (boostData: any) => {
      const response = await fetch('/api/admin/boosts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(boostData)
      });
      if (!response.ok) throw new Error('Failed to create boost');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Boost Created",
        description: "New boost has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/boosts'] });
      setShowCreateBoost(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ value })
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Setting Updated",
        description: "Setting has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const stats: AdminStats = statsData || {
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: '0.00',
    totalWithdrawals: '0.00'
  };

  const users: User[] = usersData?.users || [];
  const transactions: Transaction[] = transactionsData?.transactions || [];
  const tasks: Task[] = tasksData?.tasks || [];
  const boosts: Boost[] = boostsData?.boosts || [];
  const settings = settingsData?.settings || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-green-500">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-red-500">Withdrawal</Badge>;
      case 'farming':
        return <Badge className="bg-blue-500">Farming</Badge>;
      case 'referral':
        return <Badge className="bg-purple-500">Referral</Badge>;
      case 'task':
        return <Badge className="bg-yellow-500">Task</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-crypto-dark text-white">
      {/* Header */}
      <div className="crypto-card border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-crypto-accent" />
            <h1 className="text-xl font-bold text-crypto-accent">Admin Panel</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-600 hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-6 bg-crypto-card">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <ListTodo className="w-4 h-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="boosts" className="flex items-center space-x-2">
              <Rocket className="w-4 h-4" />
              <span>Boosts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="crypto-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-crypto-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-crypto-accent">
                    {statsLoading ? '...' : stats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <TrendingUp className="w-4 h-4 text-crypto-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-crypto-blue">
                    {statsLoading ? '...' : stats.activeUsers}
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                  <ArrowDown className="w-4 h-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    ${statsLoading ? '...' : stats.totalDeposits}
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                  <ArrowUp className="w-4 h-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    ${statsLoading ? '...' : stats.totalWithdrawals}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="crypto-card border-gray-700">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.userId}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="crypto-card border-gray-700">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>@{user.telegramUsername || 'unknown'}</TableCell>
                        <TableCell>{user.telegramName || 'N/A'}</TableCell>
                        <TableCell>${user.balance}</TableCell>
                        <TableCell>${user.totalEarnings}</TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>
                          <Badge className={user.farmingActive ? 'bg-green-500' : 'bg-gray-500'}>
                            {user.farmingActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="crypto-card border-gray-700">
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.id}</TableCell>
                        <TableCell>{transaction.userId}</TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell>${transaction.amount}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="max-w-32 truncate">
                          {transaction.walletAddress || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {transaction.description || 'N/A'}
                        </TableCell>
                        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Tasks</h2>
              <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                <DialogTrigger asChild>
                  <Button className="crypto-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="crypto-card border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSubmit={createTaskMutation.mutate} />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="crypto-card border-gray-700">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.taskType}</TableCell>
                        <TableCell>${task.reward}</TableCell>
                        <TableCell>
                          <Badge className={task.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Boosts</h2>
              <Dialog open={showCreateBoost} onOpenChange={setShowCreateBoost}>
                <DialogTrigger asChild>
                  <Button className="crypto-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Boost
                  </Button>
                </DialogTrigger>
                <DialogContent className="crypto-card border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Create New Boost</DialogTitle>
                  </DialogHeader>
                  <BoostForm onSubmit={createBoostMutation.mutate} />
                </DialogContent>
              </Dialog>
            </div>

            <Card className="crypto-card border-gray-700">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boosts.map((boost) => (
                      <TableRow key={boost.id}>
                        <TableCell>{boost.name}</TableCell>
                        <TableCell>${boost.cost}</TableCell>
                        <TableCell>{boost.multiplier}x</TableCell>
                        <TableCell>
                          <Badge className={boost.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                            {boost.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="crypto-card border-gray-700">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
                    <div>
                      <span className="font-medium">Deposits Enabled</span>
                      <p className="text-sm text-gray-400">Allow users to make deposits</p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      onCheckedChange={(checked) => 
                        updateSettingMutation.mutate({ key: 'depositsEnabled', value: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
                    <div>
                      <span className="font-medium">Withdrawals Enabled</span>
                      <p className="text-sm text-gray-400">Allow users to make withdrawals</p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      onCheckedChange={(checked) => 
                        updateSettingMutation.mutate({ key: 'withdrawalsEnabled', value: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
                    <div>
                      <span className="font-medium">Farming Enabled</span>
                      <p className="text-sm text-gray-400">Allow users to farm USDT</p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      onCheckedChange={(checked) => 
                        updateSettingMutation.mutate({ key: 'farmingEnabled', value: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-crypto-dark rounded-lg">
                    <div>
                      <span className="font-medium">Referral System</span>
                      <p className="text-sm text-gray-400">Enable referral rewards</p>
                    </div>
                    <Switch 
                      defaultChecked={true}
                      onCheckedChange={(checked) => 
                        updateSettingMutation.mutate({ key: 'referralEnabled', value: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Task Form Component
function TaskForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    taskType: 'telegram',
    taskUrl: '',
    iconClass: 'fab fa-telegram',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="reward">Reward (USDT)</Label>
        <Input
          id="reward"
          type="number"
          step="0.01"
          value={formData.reward}
          onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="taskType">Task Type</Label>
        <select
          id="taskType"
          value={formData.taskType}
          onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
          className="w-full bg-crypto-dark border border-gray-600 rounded-md px-3 py-2"
        >
          <option value="telegram">Telegram</option>
          <option value="twitter">Twitter</option>
          <option value="youtube">YouTube</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <Label htmlFor="taskUrl">Task URL</Label>
        <Input
          id="taskUrl"
          value={formData.taskUrl}
          onChange={(e) => setFormData({ ...formData, taskUrl: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <Button type="submit" className="w-full crypto-button">
        Create Task
      </Button>
    </form>
  );
}

// Boost Form Component
function BoostForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost: '',
    multiplier: '',
    iconClass: 'fas fa-rocket',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Boost Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="cost">Cost (USDT)</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <div>
        <Label htmlFor="multiplier">Multiplier</Label>
        <Input
          id="multiplier"
          type="number"
          step="0.01"
          value={formData.multiplier}
          onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
          className="bg-crypto-dark border-gray-600"
        />
      </div>
      
      <Button type="submit" className="w-full crypto-button">
        Create Boost
      </Button>
    </form>
  );
}
