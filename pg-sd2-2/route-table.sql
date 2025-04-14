-- Create Route table for storing user routes
CREATE TABLE IF NOT EXISTS `Route` (
  `RouteID` INT PRIMARY KEY AUTO_INCREMENT,
  `UserID` VARCHAR(10) NOT NULL,
  `ActivityType` ENUM('Running', 'Cycling') NOT NULL,
  `ActivityDate` DATETIME NOT NULL,
  `Distance` DECIMAL(10,2) DEFAULT 0.00,
  `Duration` VARCHAR(10) DEFAULT '00:00:00',
  `RouteData` JSON,
  `CreateDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
