import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Basic health check - just return OK
    return NextResponse.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: "Project Elion API is running"
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}