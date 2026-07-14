# Step 1: Build the React frontend client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Step 2: Prepare the Node.js backend server and run the app
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from the client-builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port 5000 (standard backend server port)
EXPOSE 5000

# Set working directory to the server folder
WORKDIR /app/server

# Start the Express server
CMD ["npm", "start"]
