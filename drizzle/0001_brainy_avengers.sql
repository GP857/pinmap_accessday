CREATE TABLE `hourlyAccesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accessDate` timestamp NOT NULL,
	`hour` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`accessCount` int NOT NULL DEFAULT 0,
	`userId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hourlyAccesses_id` PRIMARY KEY(`id`)
);
