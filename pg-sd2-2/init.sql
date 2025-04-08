-- Set session timezone
SET time_zone = '+00:00';

-- Use correct database
CREATE DATABASE IF NOT EXISTS sd2;
USE sd2;

-- ------------------------------------------
-- Creating `User` Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS `User` (
`UserID` VARCHAR(10) NOT NULL,
`FirstName` VARCHAR(30) DEFAULT NULL,
`LastName` VARCHAR(30) DEFAULT NULL,
`Email` VARCHAR(100) UNIQUE,
`UserPasword` VARCHAR(200) DEFAULT NULL,
`DateOfBirth` DATE DEFAULT NULL,
`ExercisePreference` CHAR(10) DEFAULT NULL,
`Expertise` CHAR(10) DEFAULT NULL,
PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample users with sample passwords (in production would be properly hashed)
INSERT INTO `User` (`UserID`, `FirstName`, `LastName`, `Email`, `UserPasword`, `DateOfBirth`, `ExercisePreference`, `Expertise`) VALUES
('11', 'John', 'Smith', 'john.smith@gmail.com', 'Smith123', '1990-05-15', 'Running', 'Beginner'),
('22', 'Michelle', 'Rhoades', 'michelle.rhoades@gmail.com', 'michelle22', '1985-08-22', 'Running', 'Average'),
('33', 'Alice', 'Johnson', 'alice.johnson@gmail.com', 'AJ1992', '1992-11-30', 'Cycling', 'Advanced'),
('44', 'David', 'Taylor', 'david.taylor@gmail.com', 'DavidPass123', '1988-02-17', 'Cycling', 'Average'),
('55', 'Sophia', 'Williams', 'sophia.williams@gmail.com', 'Sophia2022', '1995-12-03', 'Running', 'Beginner');

-- ------------------------------------------
-- Creating `Activity` Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS `Activity` (
`UserID` VARCHAR(10) NOT NULL,
`ActivityType` ENUM('Running', 'Cycling') NOT NULL,
`ActivityDate` DATETIME NOT NULL,
`Location` VARCHAR(255),
`CreateDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
`UpdateDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample activities
INSERT INTO `Activity` (`UserID`, `ActivityType`, `ActivityDate`, `Location`) VALUES
('11', 'Running', '2024-03-17 07:00:00', 'Central Park'),
('22', 'Cycling', '2024-03-18 08:30:00', 'Brooklyn Bridge'),
('33', 'Running', '2024-03-19 06:15:00', 'San Francisco Bay'),
('44', 'Cycling', '2024-03-20 09:00:00', 'Los Angeles Trail'),
('55', 'Running', '2024-03-21 07:45:00', 'Chicago Riverwalk');

-- ------------------------------------------
-- Creating `BuddyRequest` Table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS `BuddyRequest` (
`ID` INT PRIMARY KEY AUTO_INCREMENT,
`SenderID` VARCHAR(10) NOT NULL,
`ReceiverID` VARCHAR(10) NOT NULL,
`Status` ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
`CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (`SenderID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE,
FOREIGN KEY (`ReceiverID`) REFERENCES `User`(`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample buddy requests
INSERT INTO `BuddyRequest` (`SenderID`, `ReceiverID`, `Status`, `CreatedAt`) VALUES
('11', '22', 'Pending', NOW()),
('22', '33', 'Accepted', NOW()),
('33', '11', 'Declined', NOW()),
('44', '55', 'Pending', NOW()),
('55', '44', 'Accepted', NOW());
