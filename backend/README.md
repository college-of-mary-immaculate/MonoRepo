# Lottong Pinoy API

Lottong Pinoy is a real-time online lottery system where users can place bets and participate in regular draws. This repository contains the backend API server.

## What is Lottong Pinoy?

Lottong Pinoy is a minute-based online lottery platform that:
- Generates random winning numbers every minute
- Processes user registrations and authentication
- Manages user virtual wallets for deposits and withdrawals
- Handles betting transactions
- Determines winners and automatically distributes prizes
- Provides real-time updates via Socket.IO

This API handles all the backend logic, database operations, and real-time communications for the lottery system.

## Core Functionality

- **Random Number Generation**: Algorithmic generation of lottery numbers
- **User Management**: Registration, authentication, and profile management
- **Virtual Wallet System**: Secure handling of user funds
- **Betting System**: Processing and validation of user bets
- **Prize Distribution**: Automatic crediting of winnings to user wallets
- **Real-time Updates**: Push notifications for lottery results

## Project Structure

### Root Directory Files
- **package.json**: Defines API dependencies and npm scripts for building and running the application
- **package-lock.json**: Automatically generated file for dependency versioning
- **.env**: Environment variables for configuration (database credentials, ports, etc.)
- **minute-lotto.sql**: SQL schema for the database, containing table definitions and initial data
- **.gitignore**: Specifies intentionally untracked files to ignore in Git
- **docker-compose.yml**: Configuration for Docker containers (MySQL database and Adminer)
- **eslint.config.js**: ESLint configuration for code linting and style enforcement
- **dbMysqlSyntax.txt**: Contains helpful MySQL syntax and commands for the project
- **README.md**: Documentation file (this file)

### src/ Directory
- **index.js**: Main entry point for the API server, sets up Express and middlewares

### src/core/
- **socket.js**: Socket.IO implementation for real-time communication
- **database.js**: Database connection and configuration for MySQL

### src/controllers/v1/
- **accountController.js**: Handles user account operations (registration, login, profiles)
- **betsController.js**: Manages betting operations (placing bets, validating bets)
- **homeController.js**: Handles homepage-related API requests
- **vwalletController.js**: Manages virtual wallet operations (deposits, withdrawals, balance)
- **winnersController.js**: Handles winner-related functionality (determining winners, distributing prizes)

### src/routes/
- **v1/**: Contains API route definitions for version 1 of the API
- **v1/index.js**: Main router that combines all route modules
- **v1/accountRoutes.js**: Routes for user account functionality
- **v1/betsRoutes.js**: Routes for betting operations
- **v1/vwalletRoutes.js**: Routes for virtual wallet operations
- **v1/winnersRoutes.js**: Routes for winner-related functionality

### src/models/
- Contains database models that interact with the MySQL database
- **User.js**: User model for authentication and profile data
- **Bet.js**: Betting model for managing user bets
- **VWallet.js**: Virtual wallet model for financial transactions
- **Winner.js**: Model for tracking winners and prizes

### src/middlewares/
- **auth.js**: Authentication middleware for protected routes
- **validation.js**: Request validation middleware
- **errorHandler.js**: Global error handling middleware

### src/utils/
- Contains utility functions used throughout the application
- **numberGenerator.js**: Random number generation for lottery draws
- **validators.js**: Input validation utilities
- **responseFormatter.js**: Standardizes API responses

### Other Directories
- **public/**: Static assets served by the API (if any)
- **node_modules/**: Node.js dependencies (not tracked in Git)

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **MySQL**: Database system for storing application data
- **Socket.IO**: For real-time bi-directional communication
- **JSON Web Tokens (JWT)**: For user authentication
- **dotenv**: For environment variables management
- **Docker**: For containerization of the database

## Database Schema

The MySQL database includes these main tables:
- **users**: Stores user account information (username, password, email)
- **vwallet**: Virtual wallet for managing user funds (balance)
- **winners**: Records of lottery winners (user_id, prize, winning_combination)
- **bets**: Stores betting information (user_id, numbers, amount)
- **transactions**: Records of all financial transactions
- **draws**: Records of all lottery draws and winning numbers

## API Endpoints

- `/v1/users`: User authentication and management
- `/v1/bets`: Betting operations
- `/v1/winners`: Winners information 
- `/v1/vwallet`: Virtual wallet operations
- `/debug/server-state`: For checking the current state of the server
- `/debug/api-info`: For viewing API server information

## Usage

### Install dependencies

```
npm install
```

### Running the API server

```
npm start
```

## Environment Variables

Create a `.env` file:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=minute_lotto
```

## Features

- Real-time winning number generation
- User authentication and account management
- Virtual wallet system
- Betting mechanism
- Winner tracking and reporting