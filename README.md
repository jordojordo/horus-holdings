# Horus Holdings

[![CI & Build checks](https://github.com/jordojordo/horus-holdings/actions/workflows/tests.yaml/badge.svg)](https://github.com/jordojordo/horus-holdings/actions/workflows/tests.yaml) [![Publish to GHCR](https://github.com/jordojordo/horus-holdings/actions/workflows/release-container.yaml/badge.svg)](https://github.com/jordojordo/horus-holdings/actions/workflows/release-container.yaml)

## Overview

Horus Holdings is a cash flow management tool designed to help users track their incomes and expenses, providing a clear visualization of their cash flow over time.

Named after the Egyptian god Horus, who symbolizes protection, stability, and prosperity, this application aims to bring financial clarity and control to its users. By offering robust user authentication, Horus Holdings ensures that each user's financial data remains secure and private, echoing the protective nature of its namesake.

> [!TIP]
> See it in action: https://horus.yokanga.xyz

![Frontend Demo](assets/frontend-demo.png)

## Quickstart

To quickly get started with Horus Holdings using Docker, you can use the provided `quickstart.sh` script. This script will set up and run both the MySQL database and the Horus Holdings application in Docker containers.

```bash
./scripts/quickstart.sh
```

This script will:
- Pull the latest MySQL and Horus Holdings Docker images.
- Run the MySQL container with the specified environment variables.
- Wait for MySQL to initialize.
- Run the Horus Holdings container with the necessary environment variables.
- Output the URLs where the frontend and backend are accessible.

## Folder Structure

The application consists of a frontend and a backend:
- **Frontend**: Located in the `./src` directory.
- **Backend**: Located in the `./server` directory.

## Database Requirement

The application requires a MySQL database to store user data. You need to set up a MySQL database and provide the connection details in the environment variables.

### Setting Up MySQL Database

1. **Install MySQL**: Follow the instructions for your operating system to install MySQL.
2. **Create a Database**: Create a new database for the application. For example:
   ```sql
   CREATE DATABASE horusdevdb;
   ```
3. **Create a User**: Create a new user and grant privileges to the database. For example:
   ```sql
   CREATE USER 'root'@'localhost' IDENTIFIED BY 'admin';
   GRANT ALL PRIVILEGES ON horusdevdb.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Running MySQL Database Locally Using Docker

For development purposes, you can run the MySQL database locally using a Docker container. Use the following command to start the MySQL container:

```sh
docker run -d --name mysql-dev \
   -e MYSQL_ROOT_PASSWORD=admin \
   -e MYSQL_DATABASE=horusdevdb \
   --network host \
   mysql:latest
```

This command will start a MySQL container with the specified environment variables.

## Building and Running the Application in a Container

The `Dockerfile` is set up to build both the frontend and backend applications in separate stages and then combine them into a final image.

### Steps to Build and Run the Container

1. **Build the Docker Image**:
   ```sh
   docker build -t horus-holdings:latest .
   ```

2. **Run the Docker Container**:
   ```sh
   docker run -d --name horus \
      --network host \
      -e DATABASE_URL=mysql://root:admin@localhost:3306/horusdevdb \
      -e CORS_ORIGIN=http://localhost \
      -e JWT_SECRET=super-secret \
      -e CLIENT_API_SCHEME=http \
      -e CLIENT_PROXY_SCHEME=ws \
      -e CLIENT_PROXY_HOST=localhost \
      -e CLIENT_PROXY_PORT=5000 \
      -e CLIENT_PROXY_PATH=/ws \
      horus-holdings:latest
   ```

This will start the frontend on port 80 and the backend on port 5000.

## Environment Variables

The following table lists the configurable and required parameters for the application.

| Parameter               | Required | Description                                                   | Default                                          |
|-------------------------|----------|---------------------------------------------------------------|--------------------------------------------------|
| `DATABASE_URL`          | *        | The URL for the database connection.                          | 'mysql://root:rootpassword@127.0.0.1:3306/horusdevdb' |
| `CORS_ORIGIN`           | *        | The origin allowed for CORS.                                  | 'http://localhost'                               |
| `JWT_SECRET`            | *        | The secret key used for JWT authentication.                   | 'super_secret_key'                               |
| `CLIENT_API_SCHEME`     |          | The scheme used for API requests (e.g. https or http).        | 'https'                                          |
| `CLIENT_PROXY_SCHEME`   |          | The scheme used for WebSocket connections. (e.g. wss or ws)   | 'wss'                                            |
| `CLIENT_PROXY_HOST`     |          | The host used for WebSocket connections. (e.g. mydomain.com ) | 'localhost'                                      |
| `CLIENT_PROXY_PORT`     |          | The port used for WebSocket connections.                      | ''                                               |
| `CLIENT_PROXY_PATH`     |          | The path used for WebSocket connections.                      | '/ws'                                            |


## Running the Application Locally

To run the application locally, you need to have Node.js and PNPM installed.

### Steps to Run Locally

1. **Install Dependencies**:
   ```sh
   pnpm install:all
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the `./server` directory with the following content:
   ```env
   DATABASE_URL=mysql://root:admin@127.0.0.1:3306/horusdevdb
   JWT_SECRET=your_secret_key
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

3. **Run the Application**:
   ```sh
   pnpm dev
   ```

This will start both the frontend and backend applications concurrently.
