import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Enums
export const UserRole = {
  SUPER_ADMIN: "super_admin",
  STUDIO_OWNER: "studio_owner",
  MODEL: "model",
  FAN: "fan",
} as const;

export const ApprovalStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const ContentType = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
} as const;

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: [UserRole.SUPER_ADMIN, UserRole.STUDIO_OWNER, UserRole.MODEL, UserRole.FAN] }).notNull().default(UserRole.FAN),
  avatar: text("avatar"),
  bio: text("bio"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  approvalStatus: text("approval_status", { enum: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] }).default(ApprovalStatus.PENDING),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Studios table
export const studios = sqliteTable("studios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
  approvalStatus: text("approval_status", { enum: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] }).default(ApprovalStatus.PENDING),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Models table (linked to studios)
export const models = sqliteTable("models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  studioId: integer("studio_id").references(() => studios.id),
  stageName: text("stage_name").notNull(),
  bio: text("bio"),
  birthday: integer("birthday", { mode: "timestamp" }),
  stats: text("stats"), // JSON string for stats
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
  approvalStatus: text("approval_status", { enum: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] }).default(ApprovalStatus.PENDING),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Content table
export const content = sqliteTable("content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => models.id),
  title: text("title"),
  description: text("description"),
  type: text("type", { enum: [ContentType.IMAGE, ContentType.VIDEO, ContentType.TEXT] }).notNull(),
  url: text("url"),
  thumbnail: text("thumbnail"),
  price: real("price"), // Price in credits
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
  approvalStatus: text("approval_status", { enum: [ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] }).default(ApprovalStatus.PENDING),
  viewCount: integer("view_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Fan follows model
export const follows = sqliteTable("follows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fanId: integer("fan_id").notNull().references(() => users.id),
  modelId: integer("model_id").notNull().references(() => models.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Content likes
export const likes = sqliteTable("likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  contentId: integer("content_id").notNull().references(() => content.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Messages between fans and models
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Fan subscriptions to models (paid)
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fanId: integer("fan_id").notNull().references(() => users.id),
  modelId: integer("model_id").notNull().references(() => models.id),
  monthlyPrice: real("monthly_price").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  startedAt: integer("started_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

// Wallet/credits for fans
export const wallets = sqliteTable("wallets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  balance: real("balance").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Transactions
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // credit, debit
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  studio: one(studios, {
    fields: [users.id],
    references: [studios.ownerId],
  }),
  model: one(models, {
    fields: [users.id],
    references: [models.userId],
  }),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
}));

export const studiosRelations = relations(studios, ({ one, many }) => ({
  owner: one(users, {
    fields: [studios.ownerId],
    references: [users.id],
  }),
  models: many(models),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  user: one(users, {
    fields: [models.userId],
    references: [users.id],
  }),
  studio: one(studios, {
    fields: [models.studioId],
    references: [studios.id],
  }),
  content: many(content),
  follows: many(follows),
  subscriptions: many(subscriptions),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  model: one(models, {
    fields: [content.modelId],
    references: [models.id],
  }),
  likes: many(likes),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  fan: one(users, {
    fields: [follows.fanId],
    references: [users.id],
  }),
  model: one(models, {
    fields: [follows.modelId],
    references: [models.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  content: one(content, {
    fields: [likes.contentId],
    references: [content.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  fan: one(users, {
    fields: [subscriptions.fanId],
    references: [users.id],
  }),
  model: one(models, {
    fields: [subscriptions.modelId],
    references: [models.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));
