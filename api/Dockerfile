# Use the official Node.js image as the base image
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Skip Chromium download as Puppeteer will use system-installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install dependencies for Chrome and Puppeteer
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Verify Chrome installation
RUN google-chrome-stable --version

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
