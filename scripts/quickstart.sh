#!/bin/bash

# Set environment variables
DATABASE_NAME=horusdevdb
DATABASE_USER=root
DATABASE_PASSWORD=admin
DATABASE_HOST=localhost
DATABASE_PORT=3306
CORS_ORIGIN="http://localhost"
JWT_SECRET="super-secret"
CLIENT_PROXY_SCHEME="ws"
CLIENT_PROXY_HOST="localhost"
CLIENT_PROXY_PORT="5000"
CLIENT_PROXY_PATH="/ws"
CLIENT_API_SCHEME="http"

# Pull the latest MySQL and Horus Holdings images
echo "Pulling the latest MySQL and Horus Holdings Docker images..."
docker pull mysql:latest
docker pull ghcr.io/jordojordo/horus-holdings:latest

# Run the MySQL container
echo "Running the MySQL container..."
docker run -d --name mysql-dev \
   -e MYSQL_ROOT_PASSWORD=$DATABASE_PASSWORD \
   -e MYSQL_DATABASE=$DATABASE_NAME \
   --network host \
   mysql:latest

# Wait for MySQL to initialize
echo "Waiting for MySQL to initialize..."
until docker exec mysql-dev mysql -uroot -p$DATABASE_PASSWORD -e "USE $DATABASE_NAME;" 2> /dev/null; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# Run the Horus Holdings container
echo "Running the Horus Holdings container..."
docker run -d --name horus \
   --network host \
   -e DATABASE_NAME=$DATABASE_NAME \
   -e DATABASE_USER=$DATABASE_USER \
   -e DATABASE_PASSWORD=$DATABASE_PASSWORD \
   -e DATABASE_HOST=$DATABASE_HOST \
   -e DATABASE_PORT=$DATABASE_PORT \
   -e CORS_ORIGIN=$CORS_ORIGIN \
   -e JWT_SECRET=$JWT_SECRET \
   -e CLIENT_PROXY_SCHEME=$CLIENT_PROXY_SCHEME \
   -e CLIENT_PROXY_HOST=$CLIENT_PROXY_HOST \
   -e CLIENT_PROXY_PORT=$CLIENT_PROXY_PORT \
   -e CLIENT_PROXY_PATH=$CLIENT_PROXY_PATH \
   -e CLIENT_API_SCHEME=$CLIENT_API_SCHEME \
   ghcr.io/jordojordo/horus-holdings:latest

echo "Horus Holdings is now running!"
echo "Frontend is accessible at $CORS_ORIGIN"
echo "Backend is accessible at http://localhost:5000"
