import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { studios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const allStudios = await db
      .select()
      .from(studios)
      .orderBy(desc(studios.createdAt));

    return NextResponse.json({ studios: allStudios });
  } catch (error) {
    console.error("Get studios error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
