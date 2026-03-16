import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { models, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const approvedModels = await db
      .select()
      .from(models)
      .where(eq(models.isApproved, true));

    const modelsWithUsers = await Promise.all(
      approvedModels.map(async (model) => {
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, model.userId));
        return { ...model, email: user?.email || "" };
      })
    );

    return NextResponse.json({ models: modelsWithUsers });
  } catch (error) {
    console.error("Get public models error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
