# Gemini Context: Full-Stack Note-Taking App (ntoe)

## Project Overview

This is a full-stack note-taking application with a clear client-server architecture. The project's goal is to provide a simple and intuitive interface for creating, managing, and storing two types of notes: "normal" and "weekly".

### Technology Stack

*   **Frontend:** The `client` directory contains a **React** single-page application (SPA), bootstrapped with `create-react-app`. It uses `axios` for API communication and `react-bootstrap` for UI components.
*   **Backend:** The `server` directory contains a **Node.js** API server built with the **Express.js** framework. It provides a RESTful API for note management.
*   **Database:** The application uses **MySQL 8.0** for its database, which is managed via Docker. The database schema includes a single `notes` table with fields for title, content (JSON), type, and timestamps.
*   **Containerization & Proxy:** The project uses **Docker** (`docker-compose.yml`) to run the MySQL database service. The frontend is configured to be served by **Nginx**, which also acts as a reverse proxy, forwarding API requests from `/api/` to the backend service.

## Building and Running

There are two primary ways to run this application, based on the project files.

### 1. Hybrid Docker & Local Development (As per README.md)

This approach uses Docker for the database and runs the frontend and backend services locally.

1.  **Start the Database:**
    ```bash
    # Starts the MySQL container in the background
    docker-compose up -d db
    ```

2.  **Run the Backend Server:**
    ```bash
    # Navigate to the server directory
    cd server
    # Install dependencies
    npm install
    # Start the server in development mode (with nodemon)
    npm run dev
    ```
    The server will be available at `http://localhost:3001`.

3.  **Run the Frontend Client:**
    ```bash
    # Navigate to the client directory
    cd client
    # Install dependencies
    npm install
    # Start the React development server
    npm start
    ```
    The client will be available at `http://localhost:3000`.

### 2. Fully Containerized (Inferred from nginx.conf)

The `nginx.conf` file implies a fully containerized setup where Nginx, the client, and the API server run in Docker containers on the same network. This setup is not yet fully defined in the `docker-compose.yml`.

```
<!--
TODO: The docker-compose.yml file should be updated to include the `client` and `api` services to enable a single `docker-compose up` command for the entire application stack. The Nginx config expects an `api` service hostname.
-->
```

## Development Conventions

*   **API:** The backend exposes a RESTful API with endpoints like `/api/notes` and `/api/health`.
*   **Backend Development:** The `dev` script uses `nodemon` to automatically restart the server on file changes.
*   **Frontend Development:** The frontend uses `react-scripts` for development, building, and testing. Standard `create-react-app` conventions apply.
*   **Dependencies:** All dependencies are managed via `npm` in their respective `client` and `server` directories.
*   **Database Schema:** The `notes` table schema is defined in the `README.md`. The `content` field is of type JSON, allowing for flexible note structures.
