import { Video, Gauge, CloudUpload, Folder, Database, BarChart3, Settings, User } from "lucide-react";

export function Sidebar() {
  return (
    <nav className="w-64 bg-card border-r border-border shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Video className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">TalentScout</h1>
        </div>
      </div>
      
      <div className="px-3">
        <div className="space-y-1">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground" data-testid="link-dashboard">
            <Gauge className="mr-3 h-4 w-4" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" data-testid="link-upload">
            <CloudUpload className="mr-3 h-4 w-4" />
            Video Upload
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" data-testid="link-files">
            <Folder className="mr-3 h-4 w-4" />
            File Manager
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" data-testid="link-database">
            <Database className="mr-3 h-4 w-4" />
            Database
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" data-testid="link-analytics">
            <BarChart3 className="mr-3 h-4 w-4" />
            Analytics
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground" data-testid="link-settings">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </a>
        </div>
      </div>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@talentscout.com</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
