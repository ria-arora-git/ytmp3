const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());

app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing URL");

  const cleanUrl = videoUrl.split("&")[0];
  console.log(`🎧 Downloading from: ${cleanUrl}`);

  // Set headers early
  res.setHeader("Content-Disposition", `attachment; filename=audio.mp3`);
  res.setHeader("Content-Type", "audio/mpeg");

  // Spawn yt-dlp
  const ytdlp = spawn("yt-dlp", [
    "-f", "bestaudio",
    "--no-playlist",
    "--geo-bypass",
    "--add-header", "Referer: https://www.youtube.com/",
    "--add-header", "User-Agent: Mozilla/5.0",
    "-o", "-",
    cleanUrl
  ]);

  // Spawn ffmpeg
  const ffmpeg = spawn("ffmpeg", [
    "-hide_banner",
    "-loglevel", "error",
    "-i", "pipe:0",
    "-f", "mp3",
    "-ab", "192000",
    "-vn",
    "pipe:1"
  ]);

  // Pipe yt-dlp → ffmpeg
  ytdlp.stdout.pipe(ffmpeg.stdin);

  // Pipe ffmpeg → response
  ffmpeg.stdout.pipe(res);

  // Log errors
  ytdlp.stderr.on("data", data => {
    console.error("❌ yt-dlp error:", data.toString());
  });

  ffmpeg.stderr.on("data", data => {
    console.error("❌ ffmpeg error:", data.toString());
  });

  // Log exits
  ytdlp.on("exit", code => {
    console.log("📦 yt-dlp exited with code", code);
  });

  ffmpeg.on("exit", code => {
    console.log("🎛️ ffmpeg exited with code", code);
    if (code !== 0 && !res.headersSent) {
      res.status(500).send("Failed to process audio");
    }
  });

  // Catch process errors
  ytdlp.on("error", err => {
    console.error("yt-dlp failed to start:", err);
    if (!res.headersSent) res.status(500).send("yt-dlp error");
  });

  ffmpeg.on("error", err => {
    console.error("ffmpeg failed to start:", err);
    if (!res.headersSent) res.status(500).send("ffmpeg error");
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
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
