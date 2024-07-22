# Horus Holdings

## Overview

Horus Holdings is a cash flow management tool that allows users to input incomes and expenses and visualize their cash flow over time. The application includes user authentication to ensure that each user's data is secure and private.

The application consists of a frontend and a backend:
- **Frontend**: Located in the `./src` directory.
- **Backend**: Located in the `./server` directory.

## Database Requirement

The application requires a MySQL database to store user data. You need to set up a MySQL database and provide the connection details in the environment variables.

### Setting Up MySQL Database

1. **Install MySQL**: Follow the instructions for your operating system to install MySQL.
2. **Create a Database**: Create a new database for the application. For example:
   ```sql
   CREATE DATABASE devdb;
   ```
3. **Create a User**: Create a new user and grant privileges to the database. For example:
   ```sql
   CREATE USER 'root'@'localhost' IDENTIFIED BY 'admin';
   GRANT ALL PRIVILEGES ON devdb.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Running MySQL Database Locally Using Docker

For development purposes, you can run the MySQL database locally using a Docker container. Use the following command to start the MySQL container:

```sh
docker run -d --name mysql-dev \
   -e MYSQL_ROOT_PASSWORD=admin \
   -e MYSQL_DATABASE=devdb \
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
      -e DATABASE_URL=mysql://root:admin@localhost:3306/devdb \
      -e CORS_ORIGIN=http://localhost:3000 \
      -e JWT_SECRET=super-secret \
      horus-holdings:latest
   ```

This will start the frontend on port 3000 and the backend on port 5000.

## Environment Variables

The following environment variables are required to run the application:

- `DATABASE_URL`: The URL for the database connection.
- `CORS_ORIGIN`: The origin allowed for CORS.
- `JWT_SECRET`: The secret key used for JWT authentication.


## Running the Application Locally

To run the application locally, you need to have Node.js and Yarn installed.

### Steps to Run Locally

1. **Install Dependencies**:
   ```sh
   yarn install:all
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the `./server` directory with the following content:
   ```env
   DATABASE_URL=mysql://root:admin@127.0.0.1:3306/devdb
   JWT_SECRET=your_secret_key
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

3. **Run the Application**:
   ```sh
   yarn dev
   ```

This will start both the frontend and backend applications concurrently.
