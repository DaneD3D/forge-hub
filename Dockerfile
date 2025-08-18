# --- Stage 1: Build the SolidJS app with Node.js and pnpm ---
# We still need Node.js to run the build tools like Vite.
FROM node:18-alpine AS build

# Use Corepack to enable pnpm directly. This avoids a separate pnpm installation step.
RUN corepack enable pnpm

# Set the working directory inside the container.
WORKDIR /app

# Copy dependency files to leverage Docker's build cache.
# pnpm uses a 'pnpm-lock.yaml' file, so we copy that instead of package-lock.json.
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install project dependencies.
# The '--frozen-lockfile' flag ensures a consistent install, which is crucial for CI/CD.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code.
COPY . .

# Build the SolidJS application.
RUN pnpm run build


# --- Stage 2: Serve the application with Node.js ---
FROM node:18-alpine AS serve

# Set the working directory for the server.
WORKDIR /app

# Copy the server script and the built assets from the build stage.
COPY server.ts ./
COPY --from=build /app/dist /app/dist

# Expose the port Node will listen on (default is 8000).
EXPOSE 8000

# Run the Node.js server script.
CMD ["node", "server.ts"]
