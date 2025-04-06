const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
app.use(cors());

app.get('/download', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('No URL provided');

  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  const ytdlp = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', videoUrl]);

  ffmpeg(ytdlp.stdout)
    .audioBitrate(128)
    .format('mp3')
    .on('error', (err) => {
      console.error('FFmpeg error:', err.message);
      res.sendStatus(500);
    })
    .pipe(res, { end: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
