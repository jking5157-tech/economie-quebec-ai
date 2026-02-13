CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connected_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`institutionName` varchar(255) NOT NULL,
	`accountType` varchar(50) NOT NULL,
	`accountNumber` varchar(100),
	`balance` decimal(10,2),
	`lastSynced` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connected_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`reminderType` varchar(50) NOT NULL,
	`dueDate` timestamp NOT NULL,
	`isRecurring` boolean DEFAULT false,
	`recurrencePattern` varchar(50),
	`notificationSent` boolean DEFAULT false,
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scanned_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`status` varchar(20) NOT NULL,
	`imageUrl` text,
	`extractedData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scanned_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`savings` decimal(10,2) NOT NULL,
	`status` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` varchar(100),
	`date` timestamp NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` varchar(50),
	`vendor` varchar(255),
	`isRecurring` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`region` varchar(100) NOT NULL,
	`savingsGoal` decimal(5,2) NOT NULL,
	`monthlyIncome` decimal(10,2) NOT NULL,
	`notificationsEnabled` boolean NOT NULL DEFAULT true,
	`darkMode` boolean NOT NULL DEFAULT false,
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
