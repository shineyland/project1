CREATE TABLE `daily_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`tasks_completed` integer NOT NULL,
	`total_tasks` integer NOT NULL,
	`all_done` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_completions_date_unique` ON `daily_completions` (`date`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_color` text DEFAULT '#7c3aed' NOT NULL,
	`created_at` integer NOT NULL
);
