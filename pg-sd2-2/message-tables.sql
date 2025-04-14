-- Create Message table for storing user messages
CREATE TABLE IF NOT EXISTS `Message` (
  `MessageID` INT PRIMARY KEY AUTO_INCREMENT,
  `SenderID` VARCHAR(10) NOT NULL,
  `ReceiverID` VARCHAR(10) NOT NULL,
  `MessageContent` TEXT NOT NULL,
  `SentTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `IsRead` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`SenderID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE,
  FOREIGN KEY (`ReceiverID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create Notification table for storing user notifications
CREATE TABLE IF NOT EXISTS `Notification` (
  `NotificationID` INT PRIMARY KEY AUTO_INCREMENT,
  `UserID` VARCHAR(10) NOT NULL,
  `NotificationType` ENUM('message', 'buddy_request', 'system') NOT NULL,
  `Content` TEXT NOT NULL,
  `RelatedID` INT,
  `CreatedTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `IsRead` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
