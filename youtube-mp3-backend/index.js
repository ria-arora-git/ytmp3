import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());

app.get('/download', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing URL');

  console.log('Starting download for:', videoUrl);

  res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  res.setHeader('Content-Type', 'audio/mpeg');

  const ytdlp = spawn('yt-dlp', [
    '-f', 'bestaudio',
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    '-o', '-', 
    videoUrl
  ]);

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-f', 'mp3',
    '-ab', '192000',
    '-vn',
    'pipe:1'
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);
  ffmpeg.stdout.pipe(res);

  ytdlp.stderr.on('data', (data) => console.error(`yt-dlp stderr: ${data}`));
  ffmpeg.stderr.on('data', (data) => console.error(`ffmpeg stderr: ${data}`));

  ytdlp.on('error', (err) => {
    console.error('yt-dlp error:', err);
    if (!res.headersSent) res.status(500).send('yt-dlp error');
  });

  ffmpeg.on('error', (err) => {
    console.error('ffmpeg error:', err);
    if (!res.headersSent) res.status(500).send('ffmpeg error');
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg exited with code ${code}`);
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
