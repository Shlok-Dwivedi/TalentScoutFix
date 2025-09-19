import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
}

export function UploadArea() {
  const [dragOver, setDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [quality, setQuality] = useState("original");
  const [category, setCategory] = useState("audition");
  const [privacy, setPrivacy] = useState("private");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, settings }: { file: File; settings: any }) => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('quality', settings.quality);
      formData.append('category', settings.category);
      formData.append('privacy', settings.privacy);
      
      return apiRequest('POST', '/api/videos/upload', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage/stats'] });
      toast({
        title: "Upload Successful",
        description: "Your video has been uploaded and is being processed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateFile = (file: File): string | null => {
    const allowedTypes = [
      'video/mp4',
      'video/mov', 
      'video/quicktime', // Proper MIME type for MOV files
      'video/avi',
      'video/x-msvideo', // Proper MIME type for AVI files
      'video/webm'
    ];
    const maxSize = 500 * 1024 * 1024; // 500MB
    
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Only MP4, MOV, AVI, and WebM are allowed.`;
    }
    
    if (file.size > maxSize) {
      return `File too large. Maximum size is 500MB.`;
    }
    
    return null;
  };

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        toast({
          title: "File Validation Error",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    // Add files to upload queue
    const newUploads: UploadFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'uploading',
    }));
    
    setUploadQueue(prev => [...prev, ...newUploads]);
    
    // Start uploading each file
    newUploads.forEach(upload => {
      uploadFile(upload);
    });
  };

  const uploadFile = async (upload: UploadFile) => {
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadQueue(prev => 
          prev.map(u => 
            u.id === upload.id 
              ? { ...u, progress: Math.min(u.progress + 10, 90) }
              : u
          )
        );
      }, 300);

      await uploadMutation.mutateAsync({
        file: upload.file,
        settings: { quality, category, privacy }
      });

      clearInterval(progressInterval);
      
      setUploadQueue(prev => 
        prev.map(u => 
          u.id === upload.id 
            ? { ...u, progress: 100, status: 'success' }
            : u
        )
      );
      
      // Remove from queue after 3 seconds
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(u => u.id !== upload.id));
      }, 3000);
      
    } catch (error) {
      setUploadQueue(prev => 
        prev.map(u => 
          u.id === upload.id 
            ? { ...u, status: 'error' }
            : u
        )
      );
    }
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(u => u.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Video Upload</h3>
        
        {/* Upload Area */}
        <div 
          className={`upload-area border-2 border-dashed rounded-lg p-8 text-center mb-4 cursor-pointer transition-all duration-300 ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          data-testid="upload-area"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <CloudUpload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium">Drag and drop video files here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Supported formats: MP4, MOV, AVI, WebM</p>
              <p>Maximum file size: 500MB</p>
            </div>
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="video/*" 
            multiple 
            onChange={handleFileChange}
            data-testid="input-file"
          />
        </div>
        
        {/* Upload Progress */}
        {uploadQueue.length > 0 && (
          <div className="space-y-3 mb-6" data-testid="upload-progress">
            {uploadQueue.map((upload) => (
              <div key={upload.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <Video className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{upload.file.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={upload.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground">{upload.progress}%</span>
                  </div>
                </div>
                <button 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeFromQueue(upload.id)}
                  data-testid={`button-remove-${upload.id}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger data-testid="select-quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="high">High (1080p)</SelectItem>
                <SelectItem value="medium">Medium (720p)</SelectItem>
                <SelectItem value="low">Low (480p)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audition">Audition</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="demo">Demo Reel</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Privacy</label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger data-testid="select-privacy">
                <SelectValue placeholder="Select privacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
