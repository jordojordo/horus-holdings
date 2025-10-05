
-- horus schema derived from Sequelize models
-- Target database: horusdevdb

-- Ensure we're in the right database (noop if executed with -D horusdevdb)
CREATE DATABASE IF NOT EXISTS `horusdevdb` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `horusdevdb`;

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
  `id`          CHAR(36)      NOT NULL,
  `name`        VARCHAR(255)  NOT NULL,
  `amount`      DECIMAL(12,2) NOT NULL,
  `category`    VARCHAR(255)  NULL,
  `date`        DATE          NULL,          -- for one-off items when recurrenceKind='none'
  `recurrenceKind`       VARCHAR(16) NOT NULL DEFAULT 'none',  -- 'none' | 'simple' | 'rrule'
  `rrule`                MEDIUMTEXT  NULL,                     -- iCal text: DTSTART + RRULE lines
  `simple`               JSON        NULL,
  `anchorDate`           DATE        NULL,                     -- start date for recurrence generation
  `endDate`              DATE        NULL,                     -- optional end date for convenience
  `count`                INT         NULL,                     -- optional cap
  `timezone`             VARCHAR(64) NULL,                     -- IANA tz, e.g. America/New_York
  `weekendAdjustment`    VARCHAR(8)  NOT NULL DEFAULT 'none',  -- none|next|prev|nearest
  `includeDates`         JSON        NULL,                     -- array of ISO dates (YYYY-MM-DD)
  `excludeDates`         JSON        NULL,                     -- array of ISO dates (YYYY-MM-DD)
  `userID`      CHAR(36)      NOT NULL,
  `createdAt`   DATETIME      NOT NULL,
  `updatedAt`   DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_incomes_userID` (`userID`),
  KEY `ix_incomes_anchor` (`anchorDate`),
  KEY `ix_incomes_date` (`date`),
  CONSTRAINT `fk_incomes_user`
    FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXPENSES
CREATE TABLE IF NOT EXISTS `expenses` (
  `id`          CHAR(36)      NOT NULL,
  `name`        VARCHAR(255)  NOT NULL,
  `amount`      DECIMAL(12,2) NOT NULL,
  `category`    VARCHAR(255)  NULL,
  `date`        DATE          NULL,
  `recurrenceKind`       VARCHAR(16) NOT NULL DEFAULT 'none',
  `rrule`                MEDIUMTEXT  NULL,
  `simple`               JSON        NULL,
  `anchorDate`           DATE        NULL,
  `endDate`              DATE        NULL,
  `count`                INT         NULL,
  `timezone`             VARCHAR(64) NULL,
  `weekendAdjustment`    VARCHAR(8)  NOT NULL DEFAULT 'none',
  `includeDates`         JSON        NULL,
  `excludeDates`         JSON        NULL,
  `userID`      CHAR(36)      NOT NULL,
  `createdAt`   DATETIME      NOT NULL,
  `updatedAt`   DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_expenses_userID` (`userID`),
  KEY `ix_expenses_anchor` (`anchorDate`),
  KEY `ix_expenses_date` (`date`),
  CONSTRAINT `fk_expenses_user`
    FOREIGN KEY (`userID`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;