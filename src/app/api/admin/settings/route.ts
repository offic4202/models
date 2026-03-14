import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const allSettings = await db.select().from(settings);
    
    const settingsObj: Record<string, string> = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value || "";
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 });
    }

    const [setting] = await db
      .insert(settings)
      .values({ key, value: value || "" })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: value || "", updatedAt: new Date() },
      })
      .returning();

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
    const user = await getSessionUser(token || null);
    
    if (!user || !isSuperAdmin(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { settings: settingsList } = body;

    if (!Array.isArray(settingsList)) {
      return NextResponse.json({ error: "Settings must be an array" }, { status: 400 });
    }

    for (const { key, value } of settingsList) {
      await db
        .insert(settings)
        .values({ key, value: value || "" })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: value || "", updatedAt: new Date() },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
