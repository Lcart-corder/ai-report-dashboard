CREATE TABLE `staff_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('sub_admin','operator','support') NOT NULL,
	`inviteToken` varchar(128),
	`inviteExpiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_members_email_unique` UNIQUE(`email`),
	CONSTRAINT `staff_members_inviteToken_unique` UNIQUE(`inviteToken`)
);
--> statement-breakpoint
CREATE TABLE `staff_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staffId` int NOT NULL,
	`category` varchar(64) NOT NULL,
	`permission` varchar(64) NOT NULL,
	`isAllowed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_permissions_id` PRIMARY KEY(`id`)
);
