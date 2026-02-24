import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isModel } from "@/lib/auth";
import { db } from "@/db";
import { users, models, content, follows, subscriptions, wallets, transactions } from "@/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

// Get model dashboard data
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

    // Get model content
    const modelContent = await db
      .select()
      .from(content)
      .where(eq(content.modelId, modelProfile.id))
      .orderBy(desc(content.createdAt));

    // Get followers count
    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.modelId, modelProfile.id));

    // Get subscribers count
    const [subscribersCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(and(
        eq(subscriptions.modelId, modelProfile.id),
        eq(subscriptions.isActive, true)
      ));

    // Get total earnings (from transactions)
    const [earnings] = await db
      .select({ total: sql<number>`SUM(${transactions.amount})` })
      .from(transactions)
      .innerJoin(wallets, eq(transactions.walletId, wallets.id));

    // Get wallet balance
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id));

    // Get recent followers
    const recentFollows = await db
      .select()
      .from(follows)
      .where(eq(follows.modelId, modelProfile.id))
      .orderBy(desc(follows.createdAt))
      .limit(10);

    const followUsers = await db.select().from(users);
    const recentFollowers = recentFollows.map(f => ({
      ...f,
      fan: followUsers.find(u => u.id === f.fanId),
    }));

    return NextResponse.json({
      profile: modelProfile,
      content: modelContent,
      stats: {
        followers: followersCount?.count || 0,
        subscribers: subscribersCount?.count || 0,
        totalEarnings: earnings?.total || 0,
        walletBalance: wallet?.balance || 0,
      },
      recentFollowers,
    });
  } catch (error) {
    console.error("Model dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
