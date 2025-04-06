FROM node:18

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg curl python3-pip && \
    pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "index.js"]
