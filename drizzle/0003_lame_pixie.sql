CREATE TABLE `anonymous_market_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hashedUserId` varchar(64) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` varchar(50) NOT NULL,
	`city` varchar(100) NOT NULL,
	`transactionMonth` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anonymous_market_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_consent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentGiven` boolean NOT NULL DEFAULT false,
	`consentDate` timestamp,
	`withdrawalDate` timestamp,
	`rewardPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_consent_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_consent_userId_unique` UNIQUE(`userId`)
);
