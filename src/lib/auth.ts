import { db } from "@/db";
import { users, wallets, UserRole } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Simple token generation (in production, use proper JWT)
export function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}:${Math.random()}`;
  return Buffer.from(payload).toString("base64");
}

export function verifyToken(token: string): { userId: number; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, timestamp] = decoded.split(":").map((s) => parseInt(s, 10));
    if (isNaN(userId) || isNaN(timestamp)) return null;
    return { userId, timestamp };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
}

export async function getSessionUser(token: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  // Token expires after 7 days
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - decoded.timestamp > sevenDays) return null;
  
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.id, decoded.userId));
  
  if (!user || !user.isActive) return null;
  
  return user;
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  role: string = "fan"
): Promise<number> {
  const passwordHash = await hashPassword(password);
  
  const [user] = await db
    .insert(users)
    .values({
      email,
      password: passwordHash,
      name,
      role: role as any,
      isActive: true,
      isVerified: role === "super_admin", // Auto-verify super admins
      approvalStatus: role === "fan" ? "approved" : "pending",
    })
    .returning({ id: users.id });
  
  // Create wallet for user
  await db.insert(wallets).values({
    userId: user.id,
    balance: 0,
  });
  
  return user.id;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  if (!user || !user.isActive) return null;
  
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
  };
}

// Role checking utilities
export function hasRole(user: SessionUser | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return hasRole(user, ["super_admin"]);
}

export function isStudioOwner(user: SessionUser | null): boolean {
  return hasRole(user, ["studio_owner", "super_admin"]);
}

export function isModel(user: SessionUser | null): boolean {
  return hasRole(user, ["model", "super_admin"]);
}
