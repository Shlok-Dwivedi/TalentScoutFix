import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function DatabaseConfig() {
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();

  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest('GET', '/api/db/test'),
    onSuccess: (response: any) => {
      const data = response.json();
      setIsConnected(true);
      toast({
        title: "Connection Test Successful",
        description: "Database connection is working properly.",
      });
    },
    onError: (error: any) => {
      setIsConnected(false);
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to connect to database.",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Database Configuration</h3>
          <Badge variant={isConnected ? "default" : "destructive"} data-testid="badge-connection-status">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Host</label>
            <Input 
              value="db.vhocmbzhvwkyzvvvgmnt.supabase.co" 
              readOnly 
              className="bg-muted"
              data-testid="input-host"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Port</label>
            <Input 
              value="5432" 
              readOnly 
              className="bg-muted"
              data-testid="input-port"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Database</label>
            <Input 
              value="postgres" 
              readOnly 
              className="bg-muted"
              data-testid="input-database"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <Input 
              value="postgres" 
              readOnly 
              className="bg-muted"
              data-testid="input-username"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <InfoIcon className="h-4 w-4" />
            <span>Last connected: Just now</span>
          </div>
          <Button 
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
            data-testid="button-test-connection"
          >
            {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
