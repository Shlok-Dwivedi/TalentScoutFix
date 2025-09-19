import { useQuery } from "@tanstack/react-query";
import { Video, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Video as VideoType } from "@shared/schema";

export function RecentUploads() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["/api/videos"],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Uploads</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-5 w-16 bg-muted rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentVideos = videos?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'processing': return 'secondary';
      case 'failed': 
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Success';
      case 'processing': return 'Processing';
      case 'uploading': return 'Uploading';
      case 'failed':
      case 'error': return 'Failed';
      default: return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Uploads</h3>
          <Button variant="ghost" size="sm" data-testid="button-view-all">View All</Button>
        </div>
        
        {recentVideos.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No uploads yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentVideos.map((video: VideoType) => (
              <div key={video.id} className="flex items-center space-x-3" data-testid={`upload-item-${video.id}`}>
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                  {video.status === 'failed' || video.status === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Video className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" data-testid={`text-filename-${video.id}`}>
                    {video.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-details-${video.id}`}>
                    {formatTimeAgo(video.createdAt)} • {formatFileSize(video.size)}
                  </p>
                </div>
                <Badge 
                  variant={getStatusColor(video.status)}
                  data-testid={`badge-status-${video.id}`}
                >
                  {getStatusText(video.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
