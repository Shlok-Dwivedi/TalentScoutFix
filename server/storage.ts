import { type User, type InsertUser, type Video, type InsertVideo } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video methods
  getVideo(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  getVideosByUser(userId: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  getStorageStats(): Promise<{
    totalFiles: number;
    totalVideos: number;
    totalSize: number;
    usedStorage: number;
    maxStorage: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private videos: Map<string, Video>;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    
    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "default-user-id",
      username: "admin",
      password: "admin123",
      email: "admin@talentscout.com",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideosByUser(userId: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.uploadedBy === userId);
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = {
      ...insertVideo,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.videos.set(id, video);
    return video;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = {
      ...video,
      ...updates,
      updatedAt: new Date(),
    };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.videos.delete(id);
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalVideos: number;
    totalSize: number;
    usedStorage: number;
    maxStorage: number;
  }> {
    const videos = Array.from(this.videos.values());
    const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
    
    return {
      totalFiles: videos.length,
      totalVideos: videos.length,
      totalSize,
      usedStorage: totalSize,
      maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
    };
  }
}

export const storage = new MemStorage();
