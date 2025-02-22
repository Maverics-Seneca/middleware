# Middleware Service

## Overview
The **Middleware Service** acts as a bridge between the frontend and backend microservices. It handles API routing, authentication, request validation, and communication between different services in the system.

## Features
- Acts as a gateway between frontend and backend services
- Routes API requests to appropriate microservices
- Handles authentication and authorization
- Validates incoming requests
- Ensures secure communication between services

## Tech Stack
- **Node.js** (Runtime)
- **Express.js** (Web Framework)

## Installation & Setup

### 1. Clone the Repository
git clone https://github.com/your-repo/middleware-service.git
cd middleware-service

### 2. Install Dependencies
npm install

### 3. Set Up Environment Variables
Create a `.env` file in the root directory and add:

PORT=5000
AUTH_SERVICE_URL=http://auth-service:4000
AFFILIATE_SERVICE_URL=http://affiliate-service:4001
MEDICATION_SERVICE_URL=http://medication-service:4002
SCRAPER_SERVICE_URL=http://scraper-service:4003
PARTNER_SERVICE_URL=http://partner-service:4004
REMINDER_SERVICE_URL=http://reminder-service:4005

### 4. Run the Middleware Locally
npm start

It will start the server on `http://localhost:5000`.

## Running with Docker

### 1. Build the Docker Image
docker build -t middleware-service .

### 2. Run the Container
docker run -d -p 5000:5000 --name middleware-container middleware-service

### 3. Check Logs
docker logs -f middleware-container

## API Endpoints

| Method | Endpoint    | Description                |
|--------|-------------|----------------------------|
| GET    | /health     | Check if middleware is running |
| POST   | /login      | Authenticate user          |
| GET    | /affiliates | Fetch affiliate data       |
| GET    | /medications| Fetch medication data      |
| GET    | /reminders  | Fetch reminders            |
| GET    | /scrape     | Trigger scraper service    |

## Stopping & Removing the Container
docker stop middleware-container && docker rm middleware-container

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-xyz`)
3. Commit changes (`git commit -m "Added feature XYZ"`)
4. Push to branch (`git push origin feature-xyz`)
5. Open a pull request

## License
This project is licensed under the MIT License.
