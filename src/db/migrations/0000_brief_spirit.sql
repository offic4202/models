CREATE TABLE `content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer NOT NULL,
	`title` text,
	`description` text,
	`type` text NOT NULL,
	`url` text,
	`thumbnail` text,
	`price` real,
	`is_public` integer DEFAULT false NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`approval_status` text DEFAULT 'pending',
	`view_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fan_id` integer NOT NULL,
	`model_id` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`fan_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`content_id` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sender_id` integer NOT NULL,
	`receiver_id` integer NOT NULL,
	`content` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`studio_id` integer,
	`stage_name` text NOT NULL,
	`bio` text,
	`birthday` integer,
	`stats` text,
	`is_approved` integer DEFAULT false NOT NULL,
	`approval_status` text DEFAULT 'pending',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `studios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo` text,
	`website` text,
	`is_approved` integer DEFAULT false NOT NULL,
	`approval_status` text DEFAULT 'pending',
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fan_id` integer NOT NULL,
	`model_id` integer NOT NULL,
	`monthly_price` real NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`started_at` integer,
	`expires_at` integer,
	FOREIGN KEY (`fan_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_id` integer NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`created_at` integer,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'fan' NOT NULL,
	`avatar` text,
	`bio` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`approval_status` text DEFAULT 'pending',
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wallets_user_id_unique` ON `wallets` (`user_id`);