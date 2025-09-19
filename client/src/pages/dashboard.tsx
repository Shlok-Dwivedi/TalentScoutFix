import { Sidebar } from "@/components/ui/sidebar";
import { DatabaseConfig } from "@/components/database-config";
import { UploadArea } from "@/components/upload-area";
import { StorageStats } from "@/components/storage-stats";
import { RecentUploads } from "@/components/recent-uploads";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

export default function Dashboard() {
  const { data: storageStats } = useQuery({
    queryKey: ["/api/storage/stats"],
  });

  return (
    <div className="flex h-screen" data-testid="dashboard">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Video Management Dashboard</h2>
              <p className="text-sm text-muted-foreground">Manage video uploads, database connections, and file storage</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full status-indicator"></div>
                <span className="text-xs font-medium">DB Connected</span>
              </div>
              <button className="p-2 text-muted-foreground hover:text-foreground" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <DatabaseConfig />
          <UploadArea />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StorageStats />
            <RecentUploads />
          </div>
          
          {/* System Status */}
          <div className="bg-card rounded-lg border border-border shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Status & Error Handling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium text-foreground">Upload Service</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h4 className="font-medium text-foreground">File Storage</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Supabase storage active</p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <h4 className="font-medium text-foreground">Validation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">All validations active</p>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-3">Current Validation Rules</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span className="text-foreground">Max file size: 500MB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span className="text-foreground">Formats: MP4, MOV, AVI, WebM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span className="text-foreground">Min duration: 10 seconds</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <span className="text-foreground">Max duration: 30 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
