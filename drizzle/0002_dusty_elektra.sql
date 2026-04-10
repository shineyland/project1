CREATE TABLE `calendar_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`content` text NOT NULL,
	`emoji` text DEFAULT '📌' NOT NULL,
	`created_at` integer NOT NULL
);
