import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { sendApprovalEmail, sendContentApprovalNotification } from "@/lib/email";
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
      pendingUsers: pendingUsers.filter((u: { role: string }) => u.role !== "fan"),
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
      case "studio": {
        const [studio] = await db
          .select()
          .from(studios)
          .where(eq(studios.id, id));
        
        if (studio) {
          const [owner] = await db
            .select()
            .from(users)
            .where(eq(users.id, studio.ownerId));
          
          if (owner) {
            await sendApprovalEmail(owner.email, owner.name, action === "approve", "studio_owner").catch(console.error);
          }
        }
        
        await db
          .update(studios)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(studios.id, id));
        break;
      }
        
      case "model": {
        const [modelRecord] = await db
          .select()
          .from(models)
          .where(eq(models.id, id));
        
        if (modelRecord) {
          const [modelUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, modelRecord.userId));
          
          if (modelUser) {
            await sendApprovalEmail(modelUser.email, modelUser.name, action === "approve", "model").catch(console.error);
          }
        }
        
        await db
          .update(models)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(models.id, id));
        break;
      }
        
      case "content": {
        const [contentRecord] = await db
          .select()
          .from(content)
          .where(eq(content.id, id));
        
        if (contentRecord) {
          const [modelRecord] = await db
            .select()
            .from(models)
            .where(eq(models.id, contentRecord.modelId));
          
          if (modelRecord) {
            const [modelUser] = await db
              .select()
              .from(users)
              .where(eq(users.id, modelRecord.userId));
            
            if (modelUser) {
              await sendContentApprovalNotification(
                modelUser.email, 
                modelUser.name, 
                contentRecord.title || "Untitled", 
                action === "approve"
              ).catch(console.error);
            }
          }
        }
        
        await db
          .update(content)
          .set({ approvalStatus: status, isApproved: action === "approve" })
          .where(eq(content.id, id));
        break;
      }
        
      case "user": {
        const [targetUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, id));
        
        if (targetUser) {
          await sendApprovalEmail(targetUser.email, targetUser.name, action === "approve", targetUser.role).catch(console.error);
        }
        
        await db
          .update(users)
          .set({ 
            approvalStatus: status, 
            isVerified: action === "approve",
            updatedAt: new Date() 
          })
          .where(eq(users.id, id));
        break;
      }
        
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
