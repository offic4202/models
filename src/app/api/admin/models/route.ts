import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { models, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const allModels = await db
      .select()
      .from(models)
      .orderBy(desc(models.createdAt));

    const modelsWithUsers = await Promise.all(
      allModels.map(async (model) => {
        const [modelUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, model.userId));
        return { ...model, user: modelUser };
      })
    );

    return NextResponse.json({ models: modelsWithUsers });
  } catch (error) {
    console.error("Get models error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
