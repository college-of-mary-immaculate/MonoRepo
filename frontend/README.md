# Lottong Pinoy SPA

Lottong Pinoy is a real-time online lottery system where users can place bets and participate in regular lottery draws. This repository contains the Single Page Application (SPA) frontend.

## What is Lottong Pinoy?

Lottong Pinoy is a minute-based online lottery platform where:
- Users register and deposit funds to their virtual wallet
- Every minute, a new lottery draw happens with randomly generated winning numbers
- Users place bets on their chosen numbers
- Winners are determined in real-time and prizes are automatically credited to their wallet

This SPA provides the user interface for the lottery system, displaying real-time draws, allowing users to place bets, manage their account, and check winning numbers.

## Project Structure

### Root Directory Files
- **server.js**: Express server that serves the SPA and manages Socket.IO connections for real-time updates
- **package.json**: Defines project dependencies and npm scripts for building and running the application
- **package-lock.json**: Automatically generated file for dependency versioning
- **vite.config.js**: Configuration for Vite bundler, defining build settings and directories
- **.gitignore**: Specifies intentionally untracked files to ignore in Git
- **eslint.config.js**: ESLint configuration for code linting and style enforcement
- **LICENSE**: License information for the project
- **README.md**: Documentation file (this file)

### src/ Directory
- **main.js**: Main entry point for the frontend application, initializes the SPA
- **index.html**: HTML template for the application that Vite uses as the entry point
- **start-multi-instance.js**: Script for running multiple instances of the app for testing and demo purposes

### src/core/
- **socket-server.js**: Server-side Socket.IO implementation for real-time communication
- **socket-client.js**: Client-side Socket.IO implementation for connecting to the server
- **api.js**: Handles API requests to the backend services
- **betService.js**: Service for managing betting operations
- **spa.js**: Core SPA functionality and routing

### src/components/
- **navigation.js**: Navigation component for site-wide navigation
- **welcome.js**: Welcome screen component
- **/profile/**: User profile functionality components
- **/register/**: User registration components
- **/lottongpinoy/**: Lottery functionality components
- **/counter/**: Countdown/timer functionality
- **/login/**: User authentication components

### src/pages/
- Contains page-level components that are rendered for different routes

### src/layouts/
- Contains layout components that define the structure of different page types

### src/styles/
- Contains CSS and style-related files for the application

### src/icons/
- Contains icon assets used throughout the application

### Other Directories
- **public/**: Static assets that are copied directly to the build directory
- **dist/**: Production build output directory
- **node_modules/**: Node.js dependencies (not tracked in Git)

## Key Features

- **Real-time Lottery System**: View live drawing of winning numbers every minute
- **User Account Management**: Register, login, and manage your profile
- **Virtual Wallet**: Deposit and withdraw funds for betting
- **Betting Interface**: Place bets on preferred numbers
- **Results Dashboard**: View past winning numbers and results
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Vite**: Modern frontend build tool
- **Vanilla JavaScript**: Plain JavaScript without frameworks
- **Socket.IO**: For real-time communication
- **Express**: Web server framework
- **Axios**: HTTP client for API requests

## Usage

### Install dependencies

```
npm install
```

### Running the app

```
npm run dev
```

### Running multiple instances

```
npm run start-multi
```