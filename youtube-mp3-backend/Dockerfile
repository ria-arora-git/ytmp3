# Use the official Node.js image as the base image
FROM node:20

# Set the working directory for the backend
WORKDIR /app/backend

# Copy backend package files and install dependencies
COPY youtube-mp3-backend/package*.json ./
RUN npm install

# Copy backend source files
COPY youtube-mp3-backend/ .

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY youtube-mp3-frontend/package*.json ./
RUN npm install

# Copy frontend source files
COPY youtube-mp3-frontend/ .

# Build the frontend
RUN npm run build

# Set the working directory back to the backend
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 8080

# Start the backend server
CMD ["npm", "start"]








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
