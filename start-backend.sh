#!/bin/sh
# Generate environment file before starting backend
pnpm generate:env

# Check if Docker is running
docker info >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Docker daemon not running. Please start Docker Desktop and try again."
  exit 1
fi

# Start the SAM API
sam local start-api --template lambda.yaml --env-vars ./dev-env.json
