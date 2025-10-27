FROM node:22-slim

# Install font rendering libraries required by @napi-rs/canvas
RUN apt-get update && apt-get install -y \
    fontconfig \
    libfreetype6 \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files and assets
COPY . .

# Build with Smithery CLI and copy fonts
RUN npx -y @smithery/cli build -o .smithery/index.cjs && \
    mkdir -p .smithery/fonts && \
    cp -r fonts/* .smithery/fonts/

# Runtime configuration
EXPOSE 8081
ENV NODE_ENV=production

# Start the server
CMD ["node", ".smithery/index.cjs"]
