
-- horus schema derived from Sequelize models
-- Target database: horusprod

-- Ensure we're in the right database (noop if executed with -D horusprod)
CREATE DATABASE IF NOT EXISTS `horusprod` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `horusprod`;

-- USERS
CREATE TABLE IF NOT EXISTS `users` (
  `id`        CHAR(36)     NOT NULL,
  `Username`  VARCHAR(255) NOT NULL,
  `Password`  VARCHAR(255) NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_users_Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PREFERENCES (one per user)
CREATE TABLE IF NOT EXISTS `preferences` (
  `id`        CHAR(36)     NOT NULL,
  `userID`    CHAR(36)     NOT NULL,
  `foobar`    VARCHAR(255) NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_preferences_userID` (`userID`),
  CONSTRAINT `fk_preferences_user`
    FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INCOMES
CREATE TABLE IF NOT EXISTS `incomes` (
  `id`                    CHAR(36)      NOT NULL,
  `description`           VARCHAR(255)  NOT NULL,
  `amount`                DOUBLE        NOT NULL,
  `category`              VARCHAR(255)  NULL,
  `date`                  DATE          NULL,
  `recurring`             TINYINT(1)    NOT NULL,
  `recurrenceType`        VARCHAR(255)  NULL,
  `recurrenceEndDate`     DATE          NULL,
  `customRecurrenceDays`  JSON          NULL,
  `userID`                CHAR(36)      NOT NULL,
  `createdAt`             DATETIME      NOT NULL,
  `updatedAt`             DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_incomes_userID` (`userID`),
  KEY `ix_incomes_date` (`date`),
  CONSTRAINT `fk_incomes_user`
    FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXPENSES
CREATE TABLE IF NOT EXISTS `expenses` (
  `id`                    CHAR(36)      NOT NULL,
  `description`           VARCHAR(255)  NOT NULL,
  `amount`                DOUBLE        NOT NULL,
  `category`              VARCHAR(255)  NULL,
  `date`                  DATE          NULL,
  `recurring`             TINYINT(1)    NOT NULL,
  `recurrenceType`        VARCHAR(255)  NULL,
  `recurrenceEndDate`     DATE          NULL,
  `customRecurrenceDays`  JSON          NULL,
  `userID`                CHAR(36)      NOT NULL,
  `createdAt`             DATETIME      NOT NULL,
  `updatedAt`             DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_expenses_userID` (`userID`),
  KEY `ix_expenses_date` (`date`),
  CONSTRAINT `fk_expenses_user`
    FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
