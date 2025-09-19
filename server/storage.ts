import { type User, type InsertUser, type Video, type InsertVideo, users, videos } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, sql } from "drizzle-orm";
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
      duration: insertVideo.duration || null,
      quality: insertVideo.quality || "original",
      category: insertVideo.category || "audition",
      privacy: insertVideo.privacy || "private",
      status: insertVideo.status || "uploading",
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

// Database storage implementation using Supabase/Neon
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const client = postgres(process.env.DATABASE_URL);
    this.db = drizzle(client);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.db.execute(sql`SELECT 1`);
      // Ensure default user exists for demo purposes
      await this.ensureDefaultUser();
      return true;
    } catch (error) {
      console.error("Database connectivity test failed:", error);
      return false;
    }
  }

  private async ensureDefaultUser(): Promise<void> {
    try {
      const existingUser = await this.getUser("default-user-id");
      if (!existingUser) {
        await this.db.insert(users).values({
          id: "default-user-id",
          username: "admin",
          password: "admin123", // In production, this should be hashed
          email: "admin@talentscout.com"
        }).onConflictDoNothing();
        console.log("✅ Default user created");
      }
    } catch (error) {
      console.log("Note: Could not create default user (tables may not exist yet):", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(videos).where(eq(videos.id, id)).limit(1);
    return result[0];
  }

  async getAllVideos(): Promise<Video[]> {
    return await this.db.select().from(videos).orderBy(videos.createdAt);
  }

  async getVideosByUser(userId: string): Promise<Video[]> {
    return await this.db.select().from(videos).where(eq(videos.uploadedBy, userId));
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const result = await this.db.insert(videos).values(insertVideo).returning();
    return result[0];
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const result = await this.db.update(videos).set(updates).where(eq(videos.id, id)).returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await this.db.delete(videos).where(eq(videos.id, id)).returning();
    return result.length > 0;
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalVideos: number;
    totalSize: number;
    usedStorage: number;
    maxStorage: number;
  }> {
    const allVideos = await this.db.select().from(videos);
    const totalSize = allVideos.reduce((sum, video) => sum + video.size, 0);
    
    return {
      totalFiles: allVideos.length,
      totalVideos: allVideos.length,
      totalSize,
      usedStorage: totalSize,
      maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
    };
  }
}

// Try to use database storage with connectivity test, fall back to memory storage if connection fails
async function createStorage(): Promise<IStorage> {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️  Using in-memory storage (no DATABASE_URL provided)");
    return new MemStorage();
  }

  try {
    const dbStorage = new DatabaseStorage();
    const isConnected = await dbStorage.testConnection();
    
    if (isConnected) {
      console.log("✅ Using PostgreSQL database storage");
      return dbStorage;
    } else {
      console.log("❌ Database connection test failed, falling back to in-memory storage");
      return new MemStorage();
    }
  } catch (error) {
    console.error("❌ Database initialization failed, falling back to in-memory storage:", error);
    return new MemStorage();
  }
}

// Initialize storage asynchronously
export let storage: IStorage = new MemStorage(); // Default fallback

createStorage().then(storageInstance => {
  storage = storageInstance;
}).catch(error => {
  console.error("Failed to initialize storage:", error);
  storage = new MemStorage();
});
