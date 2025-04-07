const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // for frontend to make requests

app.get("/download", (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL) {
    return res.status(400).send("Missing YouTube URL");
  }

  console.log("🔗 Download request:", videoURL);

  const ytdlp = spawn("yt-dlp", [
    "--user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "-f",
    "bestaudio",
    "-o",
    "-",
    videoURL,
  ]);

  const ffmpeg = spawn("ffmpeg", [
    "-i",
    "pipe:0",
    "-f",
    "mp3",
    "-b:a",
    "192k",
    "pipe:1",
  ]);

  res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
  res.setHeader("Content-Type", "audio/mpeg");

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => console.error("yt-dlp error:", data.toString()));
  ffmpeg.stderr.on("data", (data) => console.error("ffmpeg error:", data.toString()));

  ytdlp.on("close", (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
      res.status(500).end();
    }
  });

  ffmpeg.on("close", (code) => {
    if (code !== 0) {
      console.error(`ffmpeg exited with code ${code}`);
    }
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
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
