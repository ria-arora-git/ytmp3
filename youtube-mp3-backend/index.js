
const express = require('express');
const { spawn } = require('child_process');
const ytdlp = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('Missing URL');

  try {
    const ytdlpProcess = ytdlp.exec(videoUrl, {
      format: 'bestaudio',
      output: '-',
      quiet: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const ffmpegProcess = spawn(ffmpegPath, [
      '-i', 'pipe:0',
      '-f', 'mp3',
      '-ab', '192000',
      '-vn',
      'pipe:1',
    ]);

    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    ytdlpProcess.stdout.pipe(ffmpegProcess.stdin);
    ffmpegProcess.stdout.pipe(res);

    ytdlpProcess.stderr.on('data', (data) =>
      console.error('yt-dlp stderr:', data.toString())
    );
    ffmpegProcess.stderr.on('data', (data) =>
      console.error('ffmpeg stderr:', data.toString())
    );

    ytdlpProcess.on('exit', (code) => console.log('yt-dlp exited with', code));
    ffmpegProcess.on('exit', (code) => console.log('ffmpeg exited with', code));
  } catch (err) {
    console.error('ERROR:', err);
    if (!res.headersSent) res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
