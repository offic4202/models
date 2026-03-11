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
  AUDIO: "audio",
  CAM_GROUP: "cam_group",
  PRIVATE_SHOW: "private_show",
  GALLERY: "gallery",
  TEXT: "text",
} as const;

export const ContentVisibility = {
  PUBLIC: "public",
  SUBSCRIBERS: "subscribers",
  PREMIUM: "premium",
  PRIVATE: "private",
} as const;

export const ShowStatus = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  ENDED: "ended",
  CANCELLED: "cancelled",
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
  type: text("type", { 
    enum: [ContentType.IMAGE, ContentType.VIDEO, ContentType.AUDIO, ContentType.CAM_GROUP, ContentType.PRIVATE_SHOW, ContentType.GALLERY, ContentType.TEXT] 
  }).notNull(),
  url: text("url"),
  thumbnail: text("thumbnail"),
  price: real("price"), // Price in credits
  visibility: text("visibility", { 
    enum: [ContentVisibility.PUBLIC, ContentVisibility.SUBSCRIBERS, ContentVisibility.PREMIUM, ContentVisibility.PRIVATE] 
  }).default(ContentVisibility.PUBLIC),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
  isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
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

// Model Settings - individual model preferences and content settings
export const modelSettings = sqliteTable("model_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => models.id).unique(),
  // Content types enabled for this model
  enableVideo: integer("enable_video", { mode: "boolean" }).notNull().default(true),
  enableAudio: integer("enable_audio", { mode: "boolean" }).notNull().default(true),
  enableCamGroup: integer("enable_cam_group", { mode: "boolean" }).notNull().default(true),
  enablePrivateShow: integer("enable_private_show", { mode: "boolean" }).notNull().default(true),
  enableGallery: integer("enable_gallery", { mode: "boolean" }).notNull().default(true),
  // Default pricing
  defaultVideoPrice: real("default_video_price").default(10),
  defaultAudioPrice: real("default_audio_price").default(5),
  defaultGalleryPrice: real("default_gallery_price").default(8),
  defaultSubscriptionPrice: real("default_subscription_price").default(15),
  privateShowPerMin: real("private_show_per_min").default(2),
  camGroupPerMin: real("cam_group_per_min").default(1),
  // Visibility settings
  defaultVisibility: text("default_visibility", { 
    enum: [ContentVisibility.PUBLIC, ContentVisibility.SUBSCRIBERS, ContentVisibility.PREMIUM] 
  }).default(ContentVisibility.PUBLIC),
  // Profile settings
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  showOnlineStatus: integer("show_online_status", { mode: "boolean" }).notNull().default(true),
  allowTips: integer("allow_tips", { mode: "boolean" }).notNull().default(true),
  minTipAmount: real("min_tip_amount").default(1),
  // Payout settings
  payoutMethod: text("payout_method"), // bank, paypal, crypto
  payoutEmail: text("payout_email"),
  payoutThreshold: real("payout_threshold").default(50),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Studio Model Settings - studio's control over models
export const studioModelSettings = sqliteTable("studio_model_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studioId: integer("studio_id").notNull().references(() => studios.id),
  modelId: integer("model_id").notNull().references(() => models.id),
  // Revenue share (studio percentage)
  revenueSharePercent: real("revenue_share_percent").notNull().default(20),
  // Permissions controlled by studio
  canSetOwnPrices: integer("can_set_own_prices", { mode: "boolean" }).notNull().default(true),
  canCreatePublicContent: integer("can_create_public_content", { mode: "boolean" }).notNull().default(true),
  canDoCamGroup: integer("can_do_cam_group", { mode: "boolean" }).notNull().default(true),
  canDoPrivateShow: integer("can_do_private_show", { mode: "boolean" }).notNull().default(true),
  // Content approval required
  contentApprovalRequired: integer("content_approval_required", { mode: "boolean" }).notNull().default(false),
  // Status
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  addedAt: integer("added_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Scheduled Shows (cam groups, private shows)
export const scheduledShows = sqliteTable("scheduled_shows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => models.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: [ContentType.CAM_GROUP, ContentType.PRIVATE_SHOW] }).notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
  duration: integer("duration").notNull().default(60), // minutes
  price: real("price"), // per person for cam_group, total for private
  maxParticipants: integer("max_participants"), // for cam_group
  status: text("status", { 
    enum: [ShowStatus.SCHEDULED, ShowStatus.LIVE, ShowStatus.ENDED, ShowStatus.CANCELLED] 
  }).default(ShowStatus.SCHEDULED),
  isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
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

export const modelSettingsRelations = relations(modelSettings, ({ one }) => ({
  model: one(models, {
    fields: [modelSettings.modelId],
    references: [models.id],
  }),
}));

export const studioModelSettingsRelations = relations(studioModelSettings, ({ one }) => ({
  studio: one(studios, {
    fields: [studioModelSettings.studioId],
    references: [studios.id],
  }),
  model: one(models, {
    fields: [studioModelSettings.modelId],
    references: [models.id],
  }),
}));

export const scheduledShowsRelations = relations(scheduledShows, ({ one }) => ({
  model: one(models, {
    fields: [scheduledShows.modelId],
    references: [models.id],
  }),
}));
