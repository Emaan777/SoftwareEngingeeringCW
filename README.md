# Sport Buddy

Sport Buddy is a web application that connects users with similar exercise preferences and expertise levels, allowing them to find workout partners in their area.

## 🚀 Tech Stack

- **Backend**: Node.js 18, Express.js
- **Database**: MySQL 5.7
- **Frontend**: PUG templates, HTML, CSS, JavaScript
- **Containerization**: Docker, Docker Compose
- **Admin Interface**: PHPMyAdmin

## 📁 Project Structure

```
/
├── config/             # Configuration files
│   ├── .env            # Environment variables (not in version control)
│   ├── .env.example    # Example environment file
│   └── init.sql        # Database initialization script
├── src/                # Application source code
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── public/         # Static assets (CSS, JS, images)
│   ├── routes/         # Express routes
│   ├── views/          # Pug templates
│   ├── app.js          # Express application setup
│   └── index.js        # Application entry point
├── .dockerignore       # Docker ignore file
├── .gitignore          # Git ignore file
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker build instructions
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development without Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sport-buddy.git
   cd sport-buddy
   ```

2. Create environment file:
   ```bash
   cp config/.env.example config/.env
   ```
   
3. Edit the `.env` file with your preferred settings.

4. Start the application with Docker:
   ```bash
   docker-compose up
   ```

### Development

For local development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## 📱 Services and Ports

- **Web Application**: http://localhost:8000
- **PHPMyAdmin**: http://localhost:8081
- **MySQL**: localhost:3308 (externally mapped port)

## 🔍 Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start the application in development mode with auto-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint to check code quality
- `npm run docker:build` - Build Docker containers
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers


## 💾 Database

The application uses MySQL 5.7 for data storage. The database schema includes:

- Users
- Activities
- Buddy Requests

The schema is automatically created when the Docker containers start (see `config/init.sql`).

## 📝 License

This project is licensed under the ISC License. 
