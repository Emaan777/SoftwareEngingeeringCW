-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 30, 2022 at 09:54 AM
-- Server version: 8.0.24
-- PHP Version: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `test_table`
--

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 14, 2025 at 04:08 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4




/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Sport_Buddy`
--

-- --------------------------------------------------------

--

-- Creating User Table
CREATE TABLE `User` (
  `UserID` VARCHAR(10) NOT NULL,
  `FirstName` VARCHAR(30) DEFAULT NULL,
  `LastName` VARCHAR(30) DEFAULT NULL,
  `Email` VARCHAR(100) UNIQUE,
  `UserPasword` VARCHAR(25) DEFAULT NULL,
  `DateOfBirth` DATE DEFAULT NULL,
  `ExercisePreference` CHAR(10) DEFAULT NULL,
  `Expertise` CHAR(10) DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserting data into User table
INSERT INTO `User` (`UserID`, `FirstName`, `LastName`, `Email`, `UserPasword`, `DateOfBirth`, `ExercisePreference`, `Expertise`) VALUES
('11', 'John', 'Smith', 'john.smith@gmail.com', 'Smith123', '1990-05-15', 'Running', 'Beginner'),
('22', 'Michelle', 'Rhoades', 'michelle.rhoades@gmail.com', 'michelle22', '1985-08-22', 'Running', 'Average'),
('33', 'Alice', 'Johnson', 'alice.johnson@gmail.com', 'AJ1992', '1992-11-30', 'Cycling', 'Advanced'),
('44', 'David', 'Taylor', 'david.taylor@gmail.com', 'DavidPass123', '1988-02-17', 'Cycling', 'Average'),
('55', 'Sophia', 'Williams', 'sophia.williams@gmail.com', 'Sophia2022', '1995-12-03', 'Running', 'Beginner');

-- Creating Activity Table (UserID as VARCHAR(10))
CREATE TABLE Activity (
    UserID VARCHAR(10) NOT NULL, 
    ActivityType ENUM('Running', 'Cycling') NOT NULL,
    ActivityDate DATETIME NOT NULL,
    Location VARCHAR(255),
    CreateDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdateDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserting data into Activity table
INSERT INTO Activity (UserID, ActivityType, ActivityDate, Location) VALUES 
('11', 'Running', '2024-03-17 07:00:00', 'Central Park'),
('22', 'Cycling', '2024-03-18 08:30:00', 'Brooklyn Bridge'),
('33', 'Running', '2024-03-19 06:15:00', 'San Francisco Bay'),
('44', 'Cycling', '2024-03-20 09:00:00', 'Los Angeles Trail'),
('55', 'Running', '2024-03-21 07:45:00', 'Chicago Riverwalk');

-- Creating BuddyRequest Table (UserID as VARCHAR(10))
CREATE TABLE BuddyRequest (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    SenderID VARCHAR(10) NOT NULL,
    ReceiverID VARCHAR(10) NOT NULL,
    Status ENUM('Pending', 'Accepted', 'Declined') DEFAULT 'Pending',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (SenderID) REFERENCES `User`(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ReceiverID) REFERENCES `User`(UserID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserting data into BuddyRequest table
INSERT INTO BuddyRequest (SenderID, ReceiverID, Status, CreatedAt) VALUES 
('11', '22', 'Pending', NOW()),
('22', '33', 'Accepted', NOW()),
('33', '11', 'Declined', NOW()),
('44', '55', 'Pending', NOW()),
('55', '44', 'Accepted', NOW());
