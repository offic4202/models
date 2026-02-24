import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isModel } from "@/lib/auth";
import { db } from "@/db";
import { users, models, content } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Get model content
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isModel(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get model profile
    const [modelProfile] = await db
      .select()
      .from(models)
      .where(eq(models.userId, user.id));

    if (!modelProfile) {
      return NextResponse.json({ error: "Model profile not found" }, { status: 404 });
    }

    // Get all content for this model
    const modelContent = await db
      .select()
      .from(content)
      .where(eq(content.modelId, modelProfile.id))
      .orderBy(desc(content.createdAt));

    return NextResponse.json({ content: modelContent });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new content
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isModel(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get model profile
    const [modelProfile] = await db
      .select()
      .from(models)
      .where(eq(models.userId, user.id));

    if (!modelProfile) {
      return NextResponse.json({ error: "Model profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, url, thumbnail, price, isPublic } = body;

    if (!type) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 });
    }

    const validTypes = ["image", "video", "text"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Content requires approval unless it's public free content
    const requiresApproval = !isPublic || (price && price > 0);

    const [newContent] = await db
      .insert(content)
      .values({
        modelId: modelProfile.id,
        title,
        description,
        type,
        url,
        thumbnail,
        price: price || 0,
        isPublic: isPublic || false,
        isApproved: !requiresApproval,
        approvalStatus: requiresApproval ? "pending" : "approved",
      })
      .returning();

    return NextResponse.json({ success: true, content: newContent });
  } catch (error) {
    console.error("Create content error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
