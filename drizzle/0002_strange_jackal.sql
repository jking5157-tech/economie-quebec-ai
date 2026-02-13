CREATE TABLE `family_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`ownerId` int NOT NULL,
	`monthlyIncome` decimal(10,2),
	`savingsGoal` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`invitedEmail` varchar(320) NOT NULL,
	`invitedBy` int NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`token` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `family_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `family_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `family_members_id` PRIMARY KEY(`id`)
);
