import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, studios, models } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    switch (type) {
      case "user": {
        const [updated] = await db
          .update(users)
          .set({
            name: data.name,
            email: data.email,
            isActive: data.isActive,
            isVerified: data.isVerified,
            updatedAt: new Date(),
          })
          .where(eq(users.id, id))
          .returning();
        return NextResponse.json({ success: true, item: updated });
      }
      
      case "studio": {
        const [updated] = await db
          .update(studios)
          .set({
            name: data.name,
            description: data.description,
            isApproved: data.isApproved,
            approvalStatus: data.approvalStatus,
            updatedAt: new Date(),
          })
          .where(eq(studios.id, id))
          .returning();
        return NextResponse.json({ success: true, item: updated });
      }
      
      case "model": {
        const [updated] = await db
          .update(models)
          .set({
            stageName: data.stageName,
            bio: data.bio,
            isApproved: data.isApproved,
            approvalStatus: data.approvalStatus,
            updatedAt: new Date(),
          })
          .where(eq(models.id, id))
          .returning();
        return NextResponse.json({ success: true, item: updated });
      }
      
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Edit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    switch (type) {
      case "user": {
        await db.delete(users).where(eq(users.id, id));
        return NextResponse.json({ success: true });
      }
      
      case "studio": {
        await db.delete(studios).where(eq(studios.id, id));
        return NextResponse.json({ success: true });
      }
      
      case "model": {
        await db.delete(models).where(eq(models.id, id));
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
