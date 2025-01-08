DROP TABLE `payment_table`;--> statement-breakpoint
ALTER TABLE `order_table` ADD `transaction_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `order_table_transaction_id_unique` ON `order_table` (`transaction_id`);