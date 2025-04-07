import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(cors());

app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send("❌ URL is required");
  }

  console.log(`🎧 Downloading from: ${videoUrl}`);

  // Set headers early
  res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
  res.setHeader("Content-Type", "audio/mpeg");

  const ytdlp = spawn("yt-dlp", [
    "-f", "bestaudio",
    "-o", "-",
    "--quiet",
    "--no-warnings",
    "--no-playlist",
    "--add-header", "referer: https://www.youtube.com",
    "--add-header", "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    url,
  ]);
  

  ytDlp.stderr.on("data", (data) => {
    console.error(`❌ yt-dlp error: ${data}`);
  });

  ytDlp.on("error", (err) => {
    console.error("❌ Failed to start yt-dlp:", err);
    if (!res.headersSent) {
      res.status(500).send("Failed to start download.");
    }
  });

  ffmpeg(ytDlp.stdout)
    .audioBitrate(128)
    .format("mp3")
    .on("error", (err) => {
      console.error("❌ ffmpeg error:", err.message);
      if (!res.headersSent) {
        res.status(500).send("Failed to convert audio.");
      } else {
        res.end();
      }
    })
    .on("end", () => {
      console.log("✅ Conversion done");
    })
    .pipe(res, { end: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});





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
