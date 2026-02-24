import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isStudioOwner } from "@/lib/auth";
import { db } from "@/db";
import { users, studios, models } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Get models for studio owner
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isStudioOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get studio owned by user
    const [studio] = await db
      .select()
      .from(studios)
      .where(eq(studios.ownerId, user.id));

    if (!studio) {
      return NextResponse.json({ error: "No studio found" }, { status: 404 });
    }

    // Get models in this studio
    const studioModels = await db
      .select()
      .from(models)
      .where(eq(models.studioId, studio.id));

    // Get user details for each model
    const modelUsers = await db
      .select()
      .from(users);

    const modelsWithUsers = studioModels.map(m => ({
      ...m,
      user: modelUsers.find(u => u.id === m.userId),
    }));

    return NextResponse.json({ models: modelsWithUsers, studio });
  } catch (error) {
    console.error("Studio models error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a model to studio (studio owner can invite models)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isStudioOwner(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get studio owned by user
    const [studio] = await db
      .select()
      .from(studios)
      .where(eq(studios.ownerId, user.id));

    if (!studio) {
      return NextResponse.json({ error: "No studio found" }, { status: 404 });
    }

    const body = await request.json();
    const { userId, stageName, bio } = body;

    if (!userId || !stageName) {
      return NextResponse.json({ error: "User ID and stage name required" }, { status: 400 });
    }

    // Check if user exists and is a model
    const [modelUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!modelUser || modelUser.role !== "model") {
      return NextResponse.json({ error: "User must be registered as a model" }, { status: 400 });
    }

    // Check if model already has a profile
    const [existingModel] = await db
      .select()
      .from(models)
      .where(eq(models.userId, userId));

    if (existingModel) {
      return NextResponse.json({ error: "Model profile already exists" }, { status: 400 });
    }

    // Create model profile
    const [newModel] = await db
      .insert(models)
      .values({
        userId,
        studioId: studio.id,
        stageName,
        bio,
        approvalStatus: "approved", // Studio owner approves directly
        isApproved: true,
      })
      .returning();

    return NextResponse.json({ success: true, model: newModel });
  } catch (error) {
    console.error("Add model error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
