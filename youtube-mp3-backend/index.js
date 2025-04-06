const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(cors());

app.get('/download', (req, res) => {
  const videoUrl = req.query.url;
  console.log("📥 Requested video URL:", videoUrl);

  if (!videoUrl) {
    console.error("🚫 No URL provided");
    return res.status(400).send('No URL provided');
  }

  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  const ytdlp = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', videoUrl]);

  ytdlp.stderr.on('data', (data) => {
    console.error('yt-dlp stderr:', data.toString());
  });

  ytdlp.on('error', (err) => {
    console.error('yt-dlp failed to start:', err);
    return res.sendStatus(500);
  });

  ytdlp.on('close', (code) => {
    console.log(`yt-dlp exited with code ${code}`);
  });

  const ffmpegProcess = ffmpeg(ytdlp.stdout)
    .audioBitrate(128)
    .format('mp3')
    .on('start', (cmd) => {
      console.log("▶️ FFmpeg started with command:", cmd);
    })
    .on('error', (err) => {
      console.error('❌ FFmpeg error:', err.message);
      res.sendStatus(500);
    })
    .on('end', () => {
      console.log('✅ FFmpeg finished streaming');
    })
    .pipe(res, { end: true });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
