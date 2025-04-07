FROM node:18-slim

# Install ffmpeg & dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip
RUN pip install yt-dlp

# Set working directory
WORKDIR /app

# Copy only backend code
COPY package*.json ./
RUN npm install

COPY . .

# Expose port (make sure it matches your Express app)
EXPOSE 8080

# Start server
CMD ["node", "index.js"]








# FROM node:18

# FROM node:18

# # install Python and ffmpeg
# RUN apt-get update && \
#     apt-get install -y python3 python3-pip ffmpeg && \
#     ln -s /usr/bin/python3 /usr/bin/python

# # setup app
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN

# # Install ffmpeg and yt-dlp
# RUN apt-get update && \
#     apt-get install -y ffmpeg curl && \
#     curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
#     chmod a+rx /usr/local/bin/yt-dlp

# # Create app directory
# WORKDIR /app

# # Install app dependencies
# COPY package*.json ./
# RUN npm install

# # Bundle app source
# COPY . .

# EXPOSE 3000
# CMD ["node", "index.js"]
