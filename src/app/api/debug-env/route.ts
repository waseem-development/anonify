// src/app/api/debug-env/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION,
    // Check for MongoDB URI (don't show full value for security)
    hasMongoDB_URI: !!process.env.MONGODB_URI,
    mongoDB_URILength: process.env.MONGODB_URI?.length || 0,
    mongoDB_URIStartsWith: process.env.MONGODB_URI?.substring(0, 20) + "...",
    // Check other critical env vars
    envVars: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || key.includes('DATABASE') || key.includes('DB')
    ),
  });
}