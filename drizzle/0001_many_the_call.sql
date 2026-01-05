CREATE TABLE `action_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`friendId` int,
	`actionType` varchar(128) NOT NULL,
	`actionDetails` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `action_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `action_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`triggerType` enum('date','elapsed') NOT NULL,
	`triggerDate` timestamp,
	`elapsedDays` int,
	`elapsedCondition` enum('friend_added','tag_added','form_submitted'),
	`targetConditions` json,
	`actions` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `action_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auto_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`triggerType` enum('keyword','any') NOT NULL,
	`keywords` json,
	`replyMessages` json NOT NULL,
	`actions` json,
	`priority` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auto_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `broadcasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`status` enum('draft','scheduled','sent','failed') NOT NULL DEFAULT 'draft',
	`targetType` enum('all','tags','custom') NOT NULL DEFAULT 'all',
	`targetConditions` json,
	`messages` json NOT NULL,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `broadcasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`friendId` int NOT NULL,
	`direction` enum('incoming','outgoing') NOT NULL,
	`messageType` enum('text','image','video','sticker','file') NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`conversionType` enum('form_submit','purchase','custom') NOT NULL,
	`targetId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`questionOrder` int NOT NULL,
	`questionType` enum('short_text','long_text','single_choice','multiple_choice','dropdown','date','image') NOT NULL,
	`questionText` text NOT NULL,
	`required` boolean NOT NULL DEFAULT false,
	`options` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `form_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `form_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`friendId` int NOT NULL,
	`answers` json NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `form_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`headerImageUrl` text,
	`themeColor` varchar(32),
	`completionActions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friend_custom_field_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`friendId` int NOT NULL,
	`fieldId` int NOT NULL,
	`value` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friend_custom_field_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friend_custom_fields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`fieldType` enum('text','number','date','select') NOT NULL,
	`options` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friend_custom_fields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friend_tag_relations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`friendId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `friend_tag_relations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friend_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`color` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friend_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lineUserId` varchar(128) NOT NULL,
	`displayName` text,
	`pictureUrl` text,
	`statusMessage` text,
	`isBlocked` boolean NOT NULL DEFAULT false,
	`followedAt` timestamp,
	`blockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `friends_id` PRIMARY KEY(`id`),
	CONSTRAINT `friends_lineUserId_unique` UNIQUE(`lineUserId`)
);
--> statement-breakpoint
CREATE TABLE `greeting_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`messages` json NOT NULL,
	`actions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `greeting_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`integrationType` enum('shopify','rakuten','line_official','line_ads','chatgpt') NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`config` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `integrations_integrationType_unique` UNIQUE(`integrationType`)
);
--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`templateType` enum('text','image','video','card','carousel') NOT NULL,
	`content` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `message_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_calendars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`acceptanceDeadlineDays` int NOT NULL DEFAULT 0,
	`businessHours` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservation_calendars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calendarId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`durationMinutes` int NOT NULL,
	`price` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservation_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calendarId` int NOT NULL,
	`staffName` varchar(128),
	`date` timestamp NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservation_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`calendarId` int NOT NULL,
	`courseId` int NOT NULL,
	`friendId` int NOT NULL,
	`reservationDate` timestamp NOT NULL,
	`startTime` varchar(8) NOT NULL,
	`endTime` varchar(8) NOT NULL,
	`status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rich_menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`lineRichMenuId` varchar(128),
	`imageUrl` text,
	`size` json,
	`areas` json NOT NULL,
	`defaultMenu` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rich_menus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `step_scenario_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`stepOrder` int NOT NULL,
	`delayDays` int NOT NULL DEFAULT 0,
	`delayHours` int NOT NULL DEFAULT 0,
	`messages` json NOT NULL,
	`actions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `step_scenario_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `step_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`triggerType` enum('tag','action','manual') NOT NULL,
	`triggerConditions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `step_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`folder` varchar(128),
	`sourceType` enum('qr','url') NOT NULL DEFAULT 'qr',
	`url` text NOT NULL,
	`qrCodeUrl` text,
	`triggerActions` json,
	`triggerForExisting` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traffic_sources_id` PRIMARY KEY(`id`)
);
