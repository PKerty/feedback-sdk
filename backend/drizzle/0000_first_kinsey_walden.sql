CREATE TABLE `feedback_feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`device_info` text NOT NULL,
	`ip_address` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `feedback_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `feedback_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`public_key` text NOT NULL,
	`secret_key` text NOT NULL,
	`allowed_origins` text NOT NULL,
	`theme_config` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_projects_public_key_unique` ON `feedback_projects` (`public_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_projects_secret_key_unique` ON `feedback_projects` (`secret_key`);