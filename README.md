# Tournament Registration & Leaderboard System

A RESTful backend application built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for managing players, tournament registrations, score submissions, and real-time tournament leaderboards.

This codebase follows professional backend development standards, featuring a modular architectural layout, robust input validation, and centralized error handling.

---

## Technical Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database ORM:** Mongoose (MongoDB)
- **Validation:** Zod
- **Process Manager:** Nodemon (development)

---

## Directory Architecture
The project is structured following the modular controller-service pattern:

```text
tournament/
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB connection client
│   ├── controllers/
│   │   ├── playerController.js # HTTP request handler for Players
│   │   └── tournamentController.js # HTTP request handler for Tournaments
│   ├── middlewares/
│   │   ├── errorHandler.js     # Global central error formatting
│   │   └── validate.js         # Schema validation middleware
│   ├── models/
│   │   ├── Player.js           # Player Mongoose model
│   │   ├── Tournament.js       # Tournament Mongoose model
│   │   ├── Registration.js     # Registration Mongoose model
│   │   └── Score.js            # Score Mongoose model
│   ├── routes/
│   │   ├── index.js            # Base Router mounting player/tournament routes
│   │   ├── playerRoutes.js     # Routes under /players
│   │   └── tournamentRoutes.js # Routes under /tournaments
│   ├── services/
│   │   ├── playerService.js    # Business logic & checks for players
│   │   └── tournamentService.js# Registration, scoring, and ranking business logic
│   ├── utils/
│   │   ├── asyncHandler.js     # Async controller wrapper to catch errors
│   │   └── errors.js           # Custom Operational AppError classes
│   ├── validation/
│   │   └── schemas.js          # Zod validation schemas
│   └── app.js                  # App config & Express initialization
├── .env                        # Local environment variables
├── .env.example                # Example env configuration
├── package.json
└── README.md
```

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or configured via a connection string)

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or copy the example):
```bash
cp .env.example .env
```
Ensure the variables fit your environment:
```env
PORT=3000
MONGODB_URI="mongodb://127.0.0.1:27017/tournament"
NODE_ENV=development
```

### 4. Running the Application
**Development Mode (Auto-reload with Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```
The server will start listening at `http://localhost:3000`.

---

## Database Design & Compound Indexes
To ensure high database integrity and optimize query execution, custom schemas are enforced:
- **`Players`**: Stores basic info. `email` has a unique index to enforce strict single registration globally.
- **`Tournaments`**: Configured with a `maxPlayers` limit (must be $\ge 1$).
- **`Registrations`**: Has a compound unique index on `{ tournamentId: 1, playerId: 1 }` to prevent double-registrations.
- **`Scores`**: Has a compound unique index on `{ tournamentId: 1, playerId: 1 }` to guarantee that score updates overwrite existing scores rather than appending duplicates.

---

## API Specification

### 1. Player Management

#### **Create Player**
- **Endpoint:** `POST /players`
- **Request Body:**
  ```json
  {
    "name": "Yash",
    "email": "yash@example.com",
    "country": "India"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "_id": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "name": "Yash",
      "email": "yash@example.com",
      "country": "India",
      "createdAt": "2026-07-15T14:20:00.000Z",
      "__v": 0
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if fields are missing or email format is invalid.
  - `409 Conflict` if the email address is already in use.

---

### 2. Tournament Management

#### **Create Tournament**
- **Endpoint:** `POST /tournaments`
- **Request Body:**
  ```json
  {
    "name": "Valorant Pro League",
    "maxPlayers": 5
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "_id": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "name": "Valorant Pro League",
      "maxPlayers": 5,
      "createdAt": "2026-07-15T14:21:00.000Z",
      "__v": 0
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request` if `maxPlayers` is missing, $\le 0$, or not an integer.

---

### 3. Tournament Registration & Scoring

#### **Register Player to Tournament**
- **Endpoint:** `POST /tournaments/:id/register`
- **Request Body:**
  ```json
  {
    "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "_id": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "tournamentId": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "createdAt": "2026-07-15T14:22:00.000Z",
      "__v": 0
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found` if the player or tournament does not exist.
  - `409 Conflict` if the player is already registered.
  - `400 Bad Request` if the tournament is full (`maxPlayers` capacity limit reached).

---

#### **Submit/Update Score**
- **Endpoint:** `POST /tournaments/:id/score`
- **Request Body:**
  ```json
  {
    "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
    "score": 95
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "_id": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "tournamentId": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "score": 95,
      "updatedAt": "2026-07-15T14:23:00.000Z",
      "__v": 0
    }
  }
  ```
- **Note:** Submitting a score for a player who already has a score record in that tournament will overwrite/update the previous score.
- **Error Responses:**
  - `400 Bad Request` if the player is not registered for the tournament, or the score is negative ($\lt 0$).
  - `404 Not Found` if the player or tournament does not exist.

---

### 4. Leaderboard & Player Rankings

#### **Get Tournament Leaderboard**
- **Endpoint:** `GET /tournaments/:id/leaderboard`
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "rank": 1,
        "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
        "name": "Yash",
        "email": "yash@example.com",
        "country": "India",
        "score": 100
      },
      {
        "rank": 2,
        "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
        "name": "Aarav",
        "email": "aarav@example.com",
        "country": "India",
        "score": 90
      },
      {
        "rank": 2,
        "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
        "name": "Priya",
        "email": "priya@example.com",
        "country": "India",
        "score": 90
      },
      {
        "rank": 4,
        "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
        "name": "Rahul",
        "email": "rahul@example.com",
        "country": "India",
        "score": 80
      }
    ]
  }
  ```
- **Ranking Rules (Ties):**
  The system utilizes **Standard Competition Ranking** (commonly known as "1-2-2-4" ranking). If multiple players share the same score, they receive the same rank. The subsequent rank is adjusted to skip ranks based on the number of tied players.
- **Error Responses:**
  - `404 Not Found` if the tournament does not exist.

---

#### **Get Player Rank**
- **Endpoint:** `GET /tournaments/:id/player/:playerId`
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "playerId": "XXXXXXXXXXXXXXXXXXXXXXXX",
      "name": "Priya",
      "rank": 2,
      "score": 90
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found` if the tournament, player, or score does not exist.
  - `400 Bad Request` if the player is not registered for the tournament.
