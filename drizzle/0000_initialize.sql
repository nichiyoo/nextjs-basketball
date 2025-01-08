CREATE TABLE `court_table` (
	`court_id` integer PRIMARY KEY NOT NULL,
	`location_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`size` text NOT NULL,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`image` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`location_id`) REFERENCES `location_table`(`location_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `location_table` (
	`location_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_table` (
	`order_id` integer PRIMARY KEY NOT NULL,
	`court_id` integer NOT NULL,
	`total` real NOT NULL,
	`duration` integer NOT NULL,
	`date` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`court_id`) REFERENCES `court_table`(`court_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment_table` (
	`payment_id` integer PRIMARY KEY NOT NULL,
	`order_id` integer NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `reservation_table`(`reservation_id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reservation_table` (
	`reservation_id` integer PRIMARY KEY NOT NULL,
	`order_id` integer NOT NULL,
	`hour` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `order_table`(`order_id`) ON UPDATE cascade ON DELETE cascade
);
