#!/bin/bash

# Set environment variables
MYSQL_ROOT_PASSWORD=admin
MYSQL_DATABASE=horusdevdb
DATABASE_URL="mysql://root:$MYSQL_ROOT_PASSWORD@localhost:3306/$MYSQL_DATABASE"
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
   -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
   -e MYSQL_DATABASE=$MYSQL_DATABASE \
   --network host \
   mysql:latest

# Wait for MySQL to initialize
echo "Waiting for MySQL to initialize..."
until docker exec mysql-dev mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "USE $MYSQL_DATABASE;" 2> /dev/null; do
    echo "Waiting for MySQL to be ready..."
    sleep 2
done

# Run the Horus Holdings container
echo "Running the Horus Holdings container..."
docker run -d --name horus \
   --network host \
   -e DATABASE_URL=$DATABASE_URL \
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
