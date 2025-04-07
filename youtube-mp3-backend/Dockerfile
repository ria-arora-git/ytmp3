FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apt update && apt install -y ffmpeg python3-pip
RUN pip install yt-dlp

COPY . .

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
