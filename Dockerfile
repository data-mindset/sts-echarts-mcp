FROM node:22-slim

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files and assets (including fonts directory)
COPY . .

# Build with Smithery CLI
RUN npx -y @smithery/cli build -o .smithery/index.cjs

# Runtime configuration
EXPOSE 8081
ENV NODE_ENV=production

# Start the server (command will be overridden by smithery.yaml)
CMD ["node", ".smithery/index.cjs"]
