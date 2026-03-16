import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, models } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, stageName, bio, category, location, avatar } = body;

    if (!email || !password || !stageName) {
      return NextResponse.json({ error: "Email, password, and stage name are required" }, { status: 400 });
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    let userId: number;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          name: name || stageName,
          role: "model",
          isActive: true,
          isVerified: true,
          approvalStatus: "approved",
        })
        .returning();
      userId = newUser.id;
    }

    // Create model profile
    const [modelProfile] = await db
      .insert(models)
      .values({
        userId,
        stageName,
        bio: bio || "",
        category: category || "Fashion",
        location: location || "",
        avatar: avatar || "",
        isApproved: true,
        approvalStatus: "approved",
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      model: modelProfile,
      user: { id: userId, email, name: name || stageName }
    });
  } catch (error) {
    console.error("Create model error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
