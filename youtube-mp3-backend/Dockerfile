FROM node:18

# Install system dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg curl python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (make sure this matches your app)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
