import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Lock } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', '/api/secure/admin/auth/9f8a3b2c7d1e5f4g6h8i9j0k', { password });
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', data.token);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleLogin = () => {
    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter the admin password",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(password);
  };

  // Check for existing token on mount
  React.useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <Card className="crypto-card border border-gray-700 w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-crypto-accent mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-white">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Admin Password</label>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-crypto-dark text-white border-gray-600 focus:border-crypto-accent"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loginMutation.isPending}
              className="w-full crypto-button text-white font-semibold py-2 px-4 rounded-lg"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminPanel token={token} onLogout={() => setIsAuthenticated(false)} />;
}
