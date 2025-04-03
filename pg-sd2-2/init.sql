-- Create the User table if it doesn't exist
CREATE TABLE IF NOT EXISTS User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    password VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255)
);

-- Insert some sample data if the table is empty
INSERT INTO User (Email, name, password, phone, address)
SELECT 'user1@example.com', 'John Doe', 'password123', '123-456-7890', '123 Main St'
WHERE NOT EXISTS (SELECT 1 FROM User WHERE Email = 'user1@example.com');

INSERT INTO User (Email, name, password, phone, address)
SELECT 'user2@example.com', 'Jane Smith', 'password456', '987-654-3210', '456 Elm St'
WHERE NOT EXISTS (SELECT 1 FROM User WHERE Email = 'user2@example.com');

INSERT INTO User (Email, name, password, phone, address)
SELECT 'user3@example.com', 'Bob Johnson', 'password789', '555-555-5555', '789 Oak St'
WHERE NOT EXISTS (SELECT 1 FROM User WHERE Email = 'user3@example.com'); 