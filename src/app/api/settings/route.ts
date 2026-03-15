import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");
    
    if (key) {
      const [setting] = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key));
      
      return NextResponse.json({ value: setting?.value || "" });
    }

    const allSettings = await db.select().from(settings);
    
    const settingsObj: Record<string, string> = {};
    allSettings.forEach(s => {
      settingsObj[s.key] = s.value || "";
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
