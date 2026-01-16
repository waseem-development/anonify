// src/lib/dbConnect.ts
import mongoose from "mongoose";

// Ensure environment variable is defined
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Narrowed constant for TypeScript
const uri: string = MONGODB_URI;

declare global {
  // Cache to prevent multiple connections in development
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize cache if it doesn't exist
if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  // Return existing connection if present
  if (global.mongooseCache.conn) {
    console.log("Using existing database connection");
    return global.mongooseCache.conn;
  }

  // If connection is in progress, wait for it
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10, // prevent too many connections
        minPoolSize: 1,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  // Await the connection promise
  global.mongooseCache.conn = await global.mongooseCache.promise;
  console.log("Database connected successfully");

  return global.mongooseCache.conn;
}