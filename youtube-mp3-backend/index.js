import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());

app.get('/download', (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send('Missing YouTube URL');
  }

  console.log(`🎧 Downloading from: ${videoUrl}`);

  const ytDlp = spawn('yt-dlp', [
    '-f', 'bestaudio',
    '-o', '-', // output to stdout
    '--quiet',
    '--no-warnings',
    '--no-playlist',
    '--add-header', 'referer:youtube.com',
    '--add-header', 'user-agent:Mozilla/5.0',
    videoUrl,
  ]);

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-ab', '192000',
    '-vn',
    'pipe:1',
  ]);

  // Pipe yt-dlp output to ffmpeg input
  ytDlp.stdout.pipe(ffmpeg.stdin);

  // Pipe ffmpeg output to response
  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');
  ffmpeg.stdout.pipe(res);

  ytDlp.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.toLowerCase().includes('error')) {
      console.error(`❌ yt-dlp error: ${output}`);
    } else {
      console.log(`📦 yt-dlp log: ${output}`);
    }
  });

  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.toLowerCase().includes('error')) {
      console.error(`❌ ffmpeg error: ${output}`);
    } else {
      console.log(`📦 ffmpeg progress: ${output}`);
    }
  });

  ytDlp.on('error', (err) => {
    console.error('❌ Failed to start yt-dlp:', err);
    res.status(500).send('yt-dlp failed to start');
  });

  ffmpeg.on('error', (err) => {
    console.error('❌ Failed to start ffmpeg:', err);
    res.status(500).send('ffmpeg failed to start');
  });

  ytDlp.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ yt-dlp exited with code ${code}`);
    }
  });

  ffmpeg.on('close', (code) => {
    if (code === 0) {
      console.log('✅ ffmpeg finished successfully');
    } else {
      console.error(`❌ ffmpeg exited with code ${code}`);
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});




// import express from "express";
// import cors from "cors";
// import { spawn } from "child_process";

// const app = express();
// const PORT = process.env.PORT || 8080;

// app.use(cors());

// app.get("/download", async (req, res) => {
//   const videoUrl = req.query.url;

//   if (!videoUrl) {
//     return res.status(400).send("Missing URL parameter");
//   }

//   console.log(`🎧 Downloading from: ${videoUrl}`);

//   const ytdlp = spawn("yt-dlp", [
//     "-f", "bestaudio",
//     "-o", "-",
//     "--quiet",
//     "--no-warnings",
//     "--no-playlist",
//     "--add-header", "referer: https://www.youtube.com",
//     "--add-header", "user-agent: Mozilla/5.0",
//     videoUrl,
//   ]);

//   const ffmpeg = spawn("ffmpeg", [
//     "-i", "pipe:0",
//     "-f", "mp3",
//     "-b:a", "192k",
//     "-vn",
//     "pipe:1"
//   ]);

//   // Error handling
//   ytdlp.on("error", (err) => {
//     console.error("❌ Failed to start yt-dlp:", err);
//     res.status(500).send("Failed to start yt-dlp");
//   });

//   ffmpeg.on("error", (err) => {
//     console.error("❌ Failed to start ffmpeg:", err);
//     res.status(500).send("Failed to start ffmpeg");
//   });

//   ytdlp.stdout.pipe(ffmpeg.stdin);

//   res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
//   res.setHeader("Content-Type", "audio/mpeg");

//   ffmpeg.stdout.pipe(res);

//   ffmpeg.stderr.on("data", (data) => {
//     console.error(`❌ ffmpeg error: ${data}`);
//   });

//   ytdlp.stderr.on("data", (data) => {
//     console.error(`❌ yt-dlp error: ${data}`);
//   });

//   ffmpeg.on("close", (code) => {
//     console.log(`🎛️ ffmpeg exited with code ${code}`);
//   });

//   ytdlp.on("close", (code) => {
//     console.log(`📦 yt-dlp exited with code ${code}`);
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server is running at http://localhost:${PORT}`);
// });






// const express = require('express');
// const { spawn } = require('child_process');
// const ytdlp = require('yt-dlp-exec');
// const ffmpegPath = require('ffmpeg-static');
// const cors = require('cors');

// const app = express();
// app.use(cors());

// app.get('/download', async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) return res.status(400).send('Missing URL');

//   try {
//     const ytdlpProcess = ytdlp.exec(videoUrl, {
//       format: 'bestaudio',
//       output: '-',
//       quiet: true,
//       stdio: ['ignore', 'pipe', 'pipe'],
//     });

//     const ffmpegProcess = spawn(ffmpegPath, [
//       '-i', 'pipe:0',
//       '-f', 'mp3',
//       '-ab', '192000',
//       '-vn',
//       'pipe:1',
//     ]);

//     res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
//     res.setHeader('Content-Type', 'audio/mpeg');

//     ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);
//     ffmpegProcess.stdout.pipe(res);

//     ytdlpProcess.stderr.on('data', (data) =>
//       console.error('yt-dlp stderr:', data.toString())
//     );
//     ffmpegProcess.stderr.on('data', (data) =>
//       console.error('ffmpeg stderr:', data.toString())
//     );

//     ytdlpProcess.on('exit', (code) => console.log('yt-dlp exited with', code));
//     ffmpegProcess.on('exit', (code) => console.log('ffmpeg exited with', code));
//   } catch (err) {
//     console.error('ERROR:', err);
//     if (!res.headersSent) res.status(500).send('Server Error');
//   }
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });
