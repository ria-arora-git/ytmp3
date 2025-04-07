FROM node:18

# Install dependencies for yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl && \
    ln -s /usr/bin/python3 /usr/bin/python

# Use latest yt-dlp instead of pip version
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install Node deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Start app
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
