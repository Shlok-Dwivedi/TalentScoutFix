import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export function StorageStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/storage/stats"],
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Storage Usage</h3>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const usagePercentage = stats ? Math.round((stats.usedStorage / stats.maxStorage) * 100) : 0;
  const usedGB = stats ? (stats.usedStorage / (1024 * 1024 * 1024)).toFixed(1) : "0";
  const maxGB = stats ? (stats.maxStorage / (1024 * 1024 * 1024)).toFixed(0) : "10";

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Storage Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">Used Storage</span>
              <span className="text-muted-foreground" data-testid="text-storage-usage">
                {usedGB} GB / {maxGB} GB
              </span>
            </div>
            <Progress value={usagePercentage} className="w-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-files">
                {stats?.totalFiles || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-foreground" data-testid="text-total-videos">
                {stats?.totalVideos || 0}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
