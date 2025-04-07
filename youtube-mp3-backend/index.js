const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());

app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send("Missing URL");

  const cleanUrl = videoUrl.split("&")[0]; // remove timestamp etc.
  console.log(`🔗 Download request: ${cleanUrl}`);

  // Set headers for the MP3 file response
  res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
  res.setHeader("Content-Type", "audio/mpeg");

  const ytdlp = spawn("yt-dlp", [
    "-f", "bestaudio",
    "--no-playlist",
    "--geo-bypass",
    "--add-header", "Referer: https://www.youtube.com/",
    "--add-header", "User-Agent: Mozilla/5.0",
    "-o", "-",
    cleanUrl
  ]);

  const ffmpeg = spawn("ffmpeg", [
    "-i", "pipe:0",
    "-f", "mp3",
    "-ab", "192000",
    "-vn",
    "pipe:1"
  ]);

  let totalBytes = 0;

  // yt-dlp stdout to ffmpeg stdin
  ytdlp.stdout.on("data", (chunk) => {
    totalBytes += chunk.length;
    ffmpeg.stdin.write(chunk);
  });

  ytdlp.stdout.on("end", () => {
    console.log(`✅ yt-dlp stream ended. Total bytes: ${totalBytes}`);
    ffmpeg.stdin.end();
  });

  // Pipe ffmpeg output to response
  ffmpeg.stdout.pipe(res);

  // Error handling
  ytdlp.stderr.on("data", (data) => {
    console.error("yt-dlp error:", data.toString());
  });

  ffmpeg.stderr.on("data", (data) => {
    console.error("ffmpeg error:", data.toString());
  });

  ytdlp.on("error", (err) => {
    console.error("yt-dlp failed:", err);
    if (!res.headersSent) res.status(500).send("yt-dlp error");
  });

  ffmpeg.on("error", (err) => {
    console.error("ffmpeg failed:", err);
    if (!res.headersSent) res.status(500).send("ffmpeg error");
  });

  ytdlp.on("exit", (code) => {
    console.log(`yt-dlp exited with code ${code}`);
  });

  ffmpeg.on("exit", (code) => {
    console.log(`ffmpeg exited with code ${code}`);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
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
