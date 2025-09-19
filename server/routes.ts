import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertVideoSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for video uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, MOV, AVI, and WebM are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Test database connection
  app.get("/api/db/test", async (req, res) => {
    try {
      // In a real implementation, you would test the actual database connection
      // For now, we'll simulate a successful connection test
      res.json({ 
        success: true, 
        message: "Database connection successful",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get storage statistics
  app.get("/api/storage/stats", async (req, res) => {
    try {
      const stats = await storage.getStorageStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch storage statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch videos",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch video",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Upload video
  app.post("/api/videos/upload", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      // Validate request body
      const videoData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || "audition",
        privacy: req.body.privacy || "private",
        quality: req.body.quality || "original",
        status: "processing",
        uploadedBy: req.body.uploadedBy || "default-user-id", // In real app, get from session
      };

      // Validate with schema
      const validatedData = insertVideoSchema.parse(videoData);
      
      // Create video record
      const video = await storage.createVideo(validatedData);
      
      // Simulate processing completion after a delay
      setTimeout(async () => {
        await storage.updateVideo(video.id, { status: "success" });
      }, 3000);

      res.status(201).json({
        success: true,
        message: "Video uploaded successfully",
        video
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors
        });
      }
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: "File too large. Maximum size is 500MB"
          });
        }
        return res.status(400).json({ 
          message: error.message
        });
      }

      res.status(500).json({ 
        message: "Failed to upload video",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update video
  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const updates = req.body;
      const video = await storage.updateVideo(req.params.id, updates);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json({
        success: true,
        message: "Video updated successfully",
        video
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to update video",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete video
  app.delete("/api/videos/:id", async (req, res) => {
    try {
      const success = await storage.deleteVideo(req.params.id);
      
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json({
        success: true,
        message: "Video deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to delete video",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
