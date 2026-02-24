import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, studios, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Get all users with their roles
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all users ordered by creation date
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    // Get studios for studio owners
    const userStudios = await db.select().from(studios);
    
    // Get models
    const userModels = await db.select().from(models);

    // Attach related data
    const usersWithRelations = allUsers.map(u => ({
      ...u,
      studio: userStudios.find(s => s.ownerId === u.id),
      modelProfile: userModels.find(m => m.userId === u.id),
    }));

    return NextResponse.json({ users: usersWithRelations });
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Import createUser
    const { createUser } = await import("@/lib/auth");
    const userId = await createUser(email, password, name, role);

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
