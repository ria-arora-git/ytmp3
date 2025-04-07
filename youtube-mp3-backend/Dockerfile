FROM node:18

# Install required system packages
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg curl && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose app port
EXPOSE 8080

# Start server
CMD ["node", "index.js"]

FROM node:18

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8080
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
