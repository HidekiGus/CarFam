# Stage 1: Build the React frontend
FROM node:20-alpine AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Node.js backend to serve everything
FROM node:20-bullseye-slim

WORKDIR /app

# Copy backend package and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source files
COPY backend/ ./backend/

# Copy the built React app from the build stage
# The path matches what server.js expects: path.join(__dirname, '../frontend/dist')
COPY --from=build-stage /app/frontend/dist ./frontend/dist

# Ensure the uploads directory exists
RUN mkdir -p backend/uploads

# Declare volumes for database and uploads so data persists between restarts
VOLUME ["/app/backend/db", "/app/backend/uploads"]

EXPOSE 3001

WORKDIR /app/backend
CMD ["node", "server.js"]
