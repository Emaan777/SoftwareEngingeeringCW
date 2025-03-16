-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 14, 2025 at 04:08 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Sport_Buddy`
--

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE `User` (
  `FirstName` varchar(30) DEFAULT NULL,
  `LastName` varchar(30) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `UserPasword` varchar(25) DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `ExercisePreference` char(10) DEFAULT NULL,
  `Expertise` char(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`FirstName`, `LastName`, `Email`, `UserPasword`, `DateOfBirth`, `ExercisePreference`, `Expertise`) VALUES
('John', 'Smith', 'john.smith@gmail.com', 'Smith123', '1990-05-15', 'Running', 'Beginner'),
('Michelle', 'Rhoades', 'michelle.rhoades@gmail.com', 'michelle22', '1985-08-22', 'Running', 'Average'),
('Alice', 'Johnson', 'alice.johnson@gmail.com', 'AJ1992', '1992-11-30', 'Cycling', 'Advanced'),
('David', 'Taylor', 'david.taylor@gmail.com', 'DavidPass123', '1988-02-17', 'Cycling', 'Average'),
('Sophia', 'Williams', 'sophia.williams@gmail.com', 'Sophia2022', '1995-12-03', 'Running', 'Beginner');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `User`
--
ALTER TABLE `User`
  ADD UNIQUE KEY `Email` (`Email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


CREATE TABLE activity (
    user_id INT NOT NULL, 
    Activitytype ENUM('Running', 'Cycling') NOT NULL,
    Activitydate DATETIME NOT NULL,
    Location VARCHAR(255),
    Createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updatedate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE );

