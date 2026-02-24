import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, studios, models, content } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

// Get all pending approvals
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get pending studios
    const pendingStudios = await db
      .select()
      .from(studios)
      .where(eq(studios.approvalStatus, "pending"));

    // Get pending models
    const pendingModels = await db
      .select()
      .from(models)
      .where(eq(models.approvalStatus, "pending"));

    // Get pending content
    const pendingContent = await db
      .select()
      .from(content)
      .where(eq(content.approvalStatus, "pending"));

    // Get pending users (non-fans)
    const pendingUsers = await db
      .select()
      .from(users)
      .where(or(
        eq(users.approvalStatus, "pending"),
        eq(users.approvalStatus, "approved")
      ));

    return NextResponse.json({
      pendingStudios,
      pendingModels,
      pendingContent,
      pendingUsers: pendingUsers.filter(u => u.role !== "fan"),
    });
  } catch (error) {
    console.error("Approvals error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Approve or reject an item
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, id, action } = body; // type: 'studio' | 'model' | 'content' | 'user', action: 'approve' | 'reject'

    if (!type || !id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const status = action === "approve" ? "approved" : "rejected";

    switch (type) {
      case "studio":
        await db
          .update(studios)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(studios.id, id));
        break;
        
      case "model":
        await db
          .update(models)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(models.id, id));
        break;
        
      case "content":
        await db
          .update(content)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(content.id, id));
        break;
        
      case "user":
        await db
          .update(users)
          .set({ 
            approvalStatus: status, 
            isVerified: action === "approve",
            updatedAt: new Date() 
          })
          .where(eq(users.id, id));
        break;
        
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
