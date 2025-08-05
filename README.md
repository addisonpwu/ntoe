# Note Taking App

This is a simple note-taking application with a client-server architecture. The frontend is built with React and the backend is powered by Node.js, Express, and MySQL.

## Features

*   Create, read, update, and delete notes.
*   Support for two types of notes: normal notes and weekly notes.
*   A simple and intuitive user interface.

## Tech Stack

### Frontend

*   React
*   React Bootstrap
*   Axios

### Backend

*   Node.js
*   Express.js
*   MySQL2
*   CORS

### Development

*   Nodemon

## Getting Started

### Prerequisites

*   Node.js
*   Docker

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/note-taking-app.git
    cd note-taking-app
    ```

2.  **Start the database:**

    Use Docker Compose to start the MySQL database service.

    ```bash
    docker-compose up -d db
    ```

3.  **Install server dependencies and start the server:**

    ```bash
    cd server
    npm install
    npm run dev
    ```

    The server will be running on `http://localhost:3001`.

4.  **Install client dependencies and start the client:**

    ```bash
    cd ../client
    npm install
    npm start
    ```

    The client will be running on `http://localhost:3000`.

## API Endpoints

*   `GET /api/notes`: Get all notes.
*   `POST /api/notes`: Create a new note.
*   `PUT /api/notes/:id`: Update an existing note.
*   `DELETE /api/notes/:id`: Delete a note.
*   `GET /api/health`: Check the database connection status.

## Database Schema

The `notes` table has the following schema:

*   `id`: INT, AUTO_INCREMENT, PRIMARY KEY
*   `title`: VARCHAR(255), NOT NULL
*   `content`: JSON, NOT NULL
*   `type`: ENUM('normal', 'weekly'), DEFAULT 'normal'
*   `archived`: BOOLEAN, DEFAULT FALSE
*   `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP
*   `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
